import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const updateLoadSchema = z.object({
  tarifa_ars: z.number().positive('La tarifa debe ser mayor a 0').optional(),
  tarifa_negociable: z.boolean().optional(),
  observaciones: z.string().optional(),
  fecha_entrega: z.string().optional(),
});

interface RouteContext {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: load, error } = await supabase
      .from('loads')
      .select(`
        *,
        cargador:profiles_cargador!cargador_id(
          id, empresa, cuit, contacto_nombre, rating, total_cargas, verified, avatar_url, ciudad, provincia
        )
      `)
      .eq('id', params.id)
      .single();

    if (error || !load) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Carga no encontrada' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: load });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
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
    const parsed = updateLoadSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: firstError?.message ?? 'Datos inválidos' } },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: profile } = await supabase
      .from('profiles_cargador')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'No tenés permisos para editar esta carga' } },
        { status: 403 }
      );
    }

    const { data: existingLoad } = await supabase
      .from('loads')
      .select('id, cargador_id')
      .eq('id', params.id)
      .single();

    if (!existingLoad) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Carga no encontrada' } },
        { status: 404 }
      );
    }

    if (existingLoad.cargador_id !== profile.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'No tenés permisos para editar esta carga' } },
        { status: 403 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('loads')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_ERROR', message: 'Error al actualizar la carga' } },
        { status: 500 }
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

export async function DELETE(
  _request: NextRequest,
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

    // Verify ownership
    const { data: profile } = await supabase
      .from('profiles_cargador')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'No tenés permisos para cancelar esta carga' } },
        { status: 403 }
      );
    }

    const { data: existingLoad } = await supabase
      .from('loads')
      .select('id, cargador_id, estado')
      .eq('id', params.id)
      .single();

    if (!existingLoad) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Carga no encontrada' } },
        { status: 404 }
      );
    }

    if (existingLoad.cargador_id !== profile.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'No tenés permisos para cancelar esta carga' } },
        { status: 403 }
      );
    }

    if (existingLoad.estado === 'cancelada') {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'La carga ya está cancelada' } },
        { status: 400 }
      );
    }

    const { data: cancelled, error: updateError } = await supabase
      .from('loads')
      .update({ estado: 'cancelada', updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_ERROR', message: 'Error al cancelar la carga' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: cancelled });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
