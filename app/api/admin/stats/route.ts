import { NextResponse } from 'next/server';
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

export async function GET() {
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

    // Fetch all counts in parallel
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      usersRes,
      transportistasRes,
      cargadoresRes,
      loadsRes,
      activeLoadsRes,
      subscriptionsRes,
      newSignupsRes,
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('profiles_transportista').select('id', { count: 'exact', head: true }),
      supabase.from('profiles_cargador').select('id', { count: 'exact', head: true }),
      supabase.from('loads').select('id', { count: 'exact', head: true }),
      supabase
        .from('loads')
        .select('id', { count: 'exact', head: true })
        .in('estado', ['publicada', 'aplicada', 'asignada', 'en_camino']),
      supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'activa'),
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString()),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total_users: usersRes.count ?? 0,
        total_transportistas: transportistasRes.count ?? 0,
        total_cargadores: cargadoresRes.count ?? 0,
        total_loads: loadsRes.count ?? 0,
        active_loads: activeLoadsRes.count ?? 0,
        total_subscriptions: subscriptionsRes.count ?? 0,
        new_signups_30d: newSignupsRes.count ?? 0,
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
