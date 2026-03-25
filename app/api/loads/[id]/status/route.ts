import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createNotification } from '@/lib/supabase/queries';
import type { TLoadStatus } from '@/types/database';

const statusUpdateSchema = z.object({
  estado: z.enum([
    'publicada', 'aplicada', 'asignada', 'en_camino',
    'entregada', 'calificada', 'cancelada',
  ]),
  transportista_asignado_id: z.string().uuid().optional(),
});

// Valid status transitions: [from] → [to] → allowed role
const VALID_TRANSITIONS: Record<string, Record<string, 'cargador' | 'transportista' | 'either' | 'system'>> = {
  publicada: { cancelada: 'cargador' },
  aplicada: { cancelada: 'cargador', asignada: 'cargador' },
  asignada: { en_camino: 'transportista' },
  en_camino: { entregada: 'either' },
  entregada: { calificada: 'system' },
};

interface RouteContext {
  params: { id: string };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Debés iniciar sesión' } },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parsed = statusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: firstError?.message ?? 'Estado inválido' } },
        { status: 400 }
      );
    }

    const nuevoEstado = parsed.data.estado;

    // Get current load
    const { data: load, error: loadError } = await supabase
      .from('loads')
      .select(`
        id, estado, cargador_id, transportista_asignado_id,
        origen_ciudad, destino_ciudad,
        cargador:profiles_cargador!cargador_id(user_id),
        transportista_asignado:profiles_transportista!transportista_asignado_id(user_id)
      `)
      .eq('id', params.id)
      .single();

    if (loadError || !load) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Carga no encontrada' } },
        { status: 404 }
      );
    }

    const currentEstado = load.estado as TLoadStatus;

    // Validate transition
    const allowedTransitions = VALID_TRANSITIONS[currentEstado];
    if (!allowedTransitions || !(nuevoEstado in allowedTransitions)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: `No se puede cambiar el estado de "${currentEstado}" a "${nuevoEstado}"`,
          },
        },
        { status: 400 }
      );
    }

    const requiredRole = allowedTransitions[nuevoEstado];

    // Determine user role in this context
    const { data: cargadorProfile } = await supabase
      .from('profiles_cargador')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { data: transportistaProfile } = await supabase
      .from('profiles_transportista')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const isCargadorOwner = cargadorProfile?.id === load.cargador_id;
    const isAssignedTransportista =
      transportistaProfile?.id != null &&
      load.transportista_asignado_id === transportistaProfile.id;

    // Check permission based on required role
    if (requiredRole === 'cargador' && !isCargadorOwner) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Solo el cargador puede realizar esta acción' } },
        { status: 403 }
      );
    }

    if (requiredRole === 'transportista' && !isAssignedTransportista) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Solo el transportista asignado puede realizar esta acción' } },
        { status: 403 }
      );
    }

    if (requiredRole === 'either' && !isCargadorOwner && !isAssignedTransportista) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'No tenés permisos para realizar esta acción' } },
        { status: 403 }
      );
    }

    if (requiredRole === 'system') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Este cambio de estado es automático del sistema' } },
        { status: 403 }
      );
    }

    // If transitioning to 'asignada', require transportista_asignado_id
    const updateData: Record<string, unknown> = {
      estado: nuevoEstado,
      updated_at: new Date().toISOString(),
    };

    if (nuevoEstado === 'asignada') {
      if (!parsed.data.transportista_asignado_id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'BAD_REQUEST',
              message: 'Debés indicar el transportista asignado (transportista_asignado_id)',
            },
          },
          { status: 400 }
        );
      }
      updateData.transportista_asignado_id = parsed.data.transportista_asignado_id;
    }

    const { data: updated, error: updateError } = await supabase
      .from('loads')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_ERROR', message: 'Error al actualizar el estado' } },
        { status: 500 }
      );
    }

    // Send notification to affected party
    const cargadorData = load.cargador as unknown as { user_id: string } | null;
    const transportistaData = load.transportista_asignado as unknown as { user_id: string } | null;

    const statusLabels: Record<string, string> = {
      cancelada: 'cancelada',
      asignada: 'asignada',
      en_camino: 'en camino',
      entregada: 'entregada',
    };

    const statusLabel = statusLabels[nuevoEstado] ?? nuevoEstado;

    // Notify the other party
    if (isCargadorOwner && transportistaData?.user_id) {
      await createNotification(
        transportistaData.user_id,
        'estado_carga',
        `Carga ${statusLabel}`,
        `La carga ${load.origen_ciudad} → ${load.destino_ciudad} fue marcada como "${statusLabel}"`,
        { load_id: params.id, estado: nuevoEstado }
      );
    } else if (isAssignedTransportista && cargadorData?.user_id) {
      await createNotification(
        cargadorData.user_id,
        'estado_carga',
        `Carga ${statusLabel}`,
        `La carga ${load.origen_ciudad} → ${load.destino_ciudad} fue marcada como "${statusLabel}"`,
        { load_id: params.id, estado: nuevoEstado }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
