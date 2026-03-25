import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { applicationSchema } from '@/utils/validations';
import { createNotification } from '@/lib/supabase/queries';

interface RouteContext {
  params: { id: string };
}

export async function GET(
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

    // Get load to check ownership
    const { data: load, error: loadError } = await supabase
      .from('loads')
      .select('id, cargador_id')
      .eq('id', params.id)
      .single();

    if (loadError || !load) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Carga no encontrada' } },
        { status: 404 }
      );
    }

    // Check if user is the cargador (load owner)
    const { data: cargadorProfile } = await supabase
      .from('profiles_cargador')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (cargadorProfile && cargadorProfile.id === load.cargador_id) {
      // Cargador: return all applications with transportista profiles
      const { data: applications, error } = await supabase
        .from('load_applications')
        .select(`
          *,
          transportista:profiles_transportista!transportista_id(
            id, nombre, apellido, cuit, rating, total_viajes, verified, avatar_url, ciudad, provincia,
            trucks(tipo, patente, capacidad_tn, marca, modelo)
          )
        `)
        .eq('load_id', params.id)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          { success: false, error: { code: 'QUERY_ERROR', message: 'Error al obtener las postulaciones' } },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data: applications });
    }

    // Check if user is a transportista
    const { data: transportistaProfile } = await supabase
      .from('profiles_transportista')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (transportistaProfile) {
      // Transportista: return only their own application
      const { data: applications, error } = await supabase
        .from('load_applications')
        .select('*')
        .eq('load_id', params.id)
        .eq('transportista_id', transportistaProfile.id);

      if (error) {
        return NextResponse.json(
          { success: false, error: { code: 'QUERY_ERROR', message: 'Error al obtener tu postulación' } },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data: applications });
    }

    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'No tenés permisos para ver estas postulaciones' } },
      { status: 403 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Debés iniciar sesión para postularte' } },
        { status: 401 }
      );
    }

    // Verify user is a transportista
    const { data: transportistaProfile } = await supabase
      .from('profiles_transportista')
      .select('id, nombre, apellido')
      .eq('user_id', user.id)
      .single();

    if (!transportistaProfile) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Solo los transportistas pueden postularse a cargas' } },
        { status: 403 }
      );
    }

    const body: unknown = await request.json();
    const parsed = applicationSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: firstError?.message ?? 'Datos inválidos' } },
        { status: 400 }
      );
    }

    // Check load exists and is available
    const { data: load, error: loadError } = await supabase
      .from('loads')
      .select(`
        id, estado, cargador_id,
        origen_ciudad, destino_ciudad,
        cargador:profiles_cargador!cargador_id(user_id)
      `)
      .eq('id', params.id)
      .single();

    if (loadError || !load) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Carga no encontrada' } },
        { status: 404 }
      );
    }

    if (load.estado !== 'publicada' && load.estado !== 'aplicada') {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Esta carga ya no acepta postulaciones' } },
        { status: 400 }
      );
    }

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from('load_applications')
      .select('id')
      .eq('load_id', params.id)
      .eq('transportista_id', transportistaProfile.id)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Ya te postulaste a esta carga' } },
        { status: 400 }
      );
    }

    // Create application
    const { data: application, error: insertError } = await supabase
      .from('load_applications')
      .insert({
        load_id: params.id,
        transportista_id: transportistaProfile.id,
        mensaje: parsed.data.mensaje ?? null,
        estado: 'pendiente' as const,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: { code: 'INSERT_ERROR', message: 'Error al crear la postulación' } },
        { status: 500 }
      );
    }

    // If load had no prior applications, update status to 'aplicada'
    if (load.estado === 'publicada') {
      await supabase
        .from('loads')
        .update({ estado: 'aplicada', updated_at: new Date().toISOString() })
        .eq('id', params.id);
    }

    // Notify cargador
    const cargadorData = load.cargador as unknown as { user_id: string } | null;
    if (cargadorData?.user_id) {
      await createNotification(
        cargadorData.user_id,
        'aplicacion_recibida',
        'Nueva postulación recibida',
        `${transportistaProfile.nombre} ${transportistaProfile.apellido} se postuló a tu carga ${load.origen_ciudad} → ${load.destino_ciudad}`,
        { load_id: params.id, application_id: application.id }
      );
    }

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
