import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createNotification } from '@/lib/supabase/queries';

const applicationDecisionSchema = z.object({
  estado: z.enum(['aceptada', 'rechazada'], {
    errorMap: () => ({ message: 'El estado debe ser "aceptada" o "rechazada"' }),
  }),
});

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
    const parsed = applicationDecisionSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: firstError?.message ?? 'Datos inválidos' } },
        { status: 400 }
      );
    }

    // Get the application with load info
    const { data: application, error: appError } = await supabase
      .from('load_applications')
      .select(`
        id, load_id, transportista_id, estado,
        transportista:profiles_transportista!transportista_id(user_id, nombre, apellido),
        load:loads!load_id(
          id, cargador_id, origen_ciudad, destino_ciudad, estado,
          cargador:profiles_cargador!cargador_id(user_id)
        )
      `)
      .eq('id', params.id)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Postulación no encontrada' } },
        { status: 404 }
      );
    }

    if (application.estado !== 'pendiente') {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Esta postulación ya fue procesada' } },
        { status: 400 }
      );
    }

    // Verify caller is the load owner (cargador)
    const { data: cargadorProfile } = await supabase
      .from('profiles_cargador')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const loadData = application.load as unknown as {
      id: string;
      cargador_id: string;
      origen_ciudad: string;
      destino_ciudad: string;
      estado: string;
      cargador: { user_id: string } | null;
    };

    if (!cargadorProfile || cargadorProfile.id !== loadData.cargador_id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Solo el dueño de la carga puede aceptar o rechazar postulaciones' } },
        { status: 403 }
      );
    }

    const transportistaData = application.transportista as unknown as {
      user_id: string;
      nombre: string;
      apellido: string;
    } | null;

    const nuevoEstado = parsed.data.estado;

    if (nuevoEstado === 'aceptada') {
      // Accept this application
      const { data: accepted, error: acceptError } = await supabase
        .from('load_applications')
        .update({ estado: 'aceptada', updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single();

      if (acceptError) {
        return NextResponse.json(
          { success: false, error: { code: 'UPDATE_ERROR', message: 'Error al aceptar la postulación' } },
          { status: 500 }
        );
      }

      // Reject all other pending applications for this load
      await supabase
        .from('load_applications')
        .update({ estado: 'rechazada', updated_at: new Date().toISOString() })
        .eq('load_id', application.load_id)
        .neq('id', params.id)
        .eq('estado', 'pendiente');

      // Update load: assign transportista and set status to 'asignada'
      await supabase
        .from('loads')
        .update({
          transportista_asignado_id: application.transportista_id,
          estado: 'asignada',
          updated_at: new Date().toISOString(),
        })
        .eq('id', application.load_id);

      // Notify accepted transportista
      if (transportistaData?.user_id) {
        await createNotification(
          transportistaData.user_id,
          'aplicacion_aceptada',
          'Postulación aceptada',
          `Tu postulación a la carga ${loadData.origen_ciudad} → ${loadData.destino_ciudad} fue aceptada`,
          { load_id: application.load_id, application_id: params.id }
        );
      }

      return NextResponse.json({ success: true, data: accepted });
    }

    // Rejecting
    const { data: rejected, error: rejectError } = await supabase
      .from('load_applications')
      .update({ estado: 'rechazada', updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single();

    if (rejectError) {
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_ERROR', message: 'Error al rechazar la postulación' } },
        { status: 500 }
      );
    }

    // Notify rejected transportista
    if (transportistaData?.user_id) {
      await createNotification(
        transportistaData.user_id,
        'aplicacion_rechazada',
        'Postulación rechazada',
        `Tu postulación a la carga ${loadData.origen_ciudad} → ${loadData.destino_ciudad} fue rechazada`,
        { load_id: application.load_id, application_id: params.id }
      );
    }

    return NextResponse.json({ success: true, data: rejected });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
