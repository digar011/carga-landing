import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')));
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('admin_logs')
      .select(
        `
        id,
        admin_id,
        action,
        entity,
        entity_id,
        details,
        created_at,
        admin:users!admin_id(email)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'QUERY_ERROR', message: 'Error al obtener logs' } },
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
