import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { TLoadStatus } from '@/types/database';

async function requireAdmin(supabase: ReturnType<typeof createServerSupabaseClient>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'UNAUTHORIZED' as const, user: null };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { error: 'FORBIDDEN' as const, user: null };
  }

  return { error: null, user };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { error: authErr } = await requireAdmin(supabase);

    if (authErr === 'UNAUTHORIZED') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Debés iniciar sesión' } },
        { status: 401 }
      );
    }
    if (authErr === 'FORBIDDEN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Acceso restringido a administradores' } },
        { status: 403 }
      );
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') ?? '';
    const status = searchParams.get('status') as TLoadStatus | null;
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')));
    const offset = (page - 1) * limit;

    let query = supabase
      .from('loads')
      .select(
        `
        *,
        cargador:profiles_cargador!cargador_id(
          id, empresa, cuit, contacto_nombre, verified, avatar_url
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('estado', status);
    }

    if (search) {
      query = query.or(
        `origen_ciudad.ilike.%${search}%,destino_ciudad.ilike.%${search}%,descripcion_carga.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'QUERY_ERROR', message: 'Error al obtener cargas' } },
        { status: 500 }
      );
    }

    const total = count ?? 0;

    return NextResponse.json({
      success: true,
      data: data ?? [],
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

interface TPatchBody {
  loadId: string;
  action: 'cancel' | 'restore';
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { error: authErr, user: adminUser } = await requireAdmin(supabase);

    if (authErr === 'UNAUTHORIZED') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Debés iniciar sesión' } },
        { status: 401 }
      );
    }
    if (authErr === 'FORBIDDEN' || !adminUser) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Acceso restringido a administradores' } },
        { status: 403 }
      );
    }

    const body = (await request.json()) as TPatchBody;
    const { loadId, action } = body;

    if (!loadId || !action) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'loadId y action son obligatorios' } },
        { status: 400 }
      );
    }

    let newStatus: TLoadStatus;

    switch (action) {
      case 'cancel':
        newStatus = 'cancelada';
        break;
      case 'restore':
        newStatus = 'publicada';
        break;
      default:
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Acción no válida' } },
          { status: 400 }
        );
    }

    const { data: load, error: updateError } = await supabase
      .from('loads')
      .update({ estado: newStatus })
      .eq('id', loadId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_ERROR', message: 'Error al actualizar la carga' } },
        { status: 500 }
      );
    }

    // Log admin action
    await supabase.from('admin_logs').insert({
      admin_id: adminUser.id,
      action,
      entity: 'load',
      entity_id: loadId,
      details: { new_status: newStatus },
    });

    return NextResponse.json({ success: true, data: load });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
