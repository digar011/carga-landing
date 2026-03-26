import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { TUserRole } from '@/types/database';

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
    const role = searchParams.get('role') as TUserRole | null;
    const verified = searchParams.get('verified');
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')));
    const offset = (page - 1) * limit;

    // Build query — select users with their profile data from both tables
    let query = supabase
      .from('users')
      .select(
        `
        id,
        email,
        role,
        created_at,
        updated_at,
        profile_transportista:profiles_transportista(
          id, nombre, apellido, cuit, telefono, provincia, ciudad,
          rating, total_viajes, verified, plan, avatar_url
        ),
        profile_cargador:profiles_cargador(
          id, empresa, cuit, contacto_nombre, contacto_telefono,
          provincia, ciudad, rating, total_cargas, verified, plan, avatar_url
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'QUERY_ERROR', message: 'Error al obtener usuarios' } },
        { status: 500 }
      );
    }

    // Post-process: flatten profile and apply verified filter
    type TUserRow = NonNullable<typeof data>[number];

    const processedUsers = (data ?? [])
      .map((user: TUserRow) => {
        const transportista = Array.isArray(user.profile_transportista)
          ? user.profile_transportista[0]
          : user.profile_transportista;
        const cargador = Array.isArray(user.profile_cargador)
          ? user.profile_cargador[0]
          : user.profile_cargador;

        const profile = transportista ?? cargador ?? null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
          nombre: transportista
            ? `${transportista.nombre} ${transportista.apellido}`
            : cargador?.empresa ?? '—',
          cuit: profile?.cuit ?? '—',
          verified: profile?.verified ?? false,
          plan: profile?.plan ?? '—',
          rating: profile?.rating ?? 0,
          provincia: profile?.provincia ?? '—',
          avatar_url: profile?.avatar_url ?? null,
        };
      })
      .filter((u) => {
        if (verified === 'true') return u.verified;
        if (verified === 'false') return !u.verified;
        return true;
      });

    const total = count ?? processedUsers.length;

    return NextResponse.json({
      success: true,
      data: processedUsers,
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
  userId: string;
  action: 'suspend' | 'activate' | 'change_role';
  value?: TUserRole;
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
    const { userId, action, value } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'userId y action son obligatorios' } },
        { status: 400 }
      );
    }

    let updateResult;

    switch (action) {
      case 'suspend': {
        // Update user metadata to mark as suspended
        // We store suspended state in profiles — update both tables
        const [tRes, cRes] = await Promise.all([
          supabase
            .from('profiles_transportista')
            .update({ verified: false })
            .eq('user_id', userId),
          supabase
            .from('profiles_cargador')
            .update({ verified: false })
            .eq('user_id', userId),
        ]);
        updateResult = tRes.error ?? cRes.error;
        break;
      }
      case 'activate': {
        const [tRes, cRes] = await Promise.all([
          supabase
            .from('profiles_transportista')
            .update({ verified: true })
            .eq('user_id', userId),
          supabase
            .from('profiles_cargador')
            .update({ verified: true })
            .eq('user_id', userId),
        ]);
        updateResult = tRes.error ?? cRes.error;
        break;
      }
      case 'change_role': {
        if (!value) {
          return NextResponse.json(
            { success: false, error: { code: 'VALIDATION_ERROR', message: 'value es obligatorio para change_role' } },
            { status: 400 }
          );
        }
        const { error } = await supabase
          .from('users')
          .update({ role: value })
          .eq('id', userId);
        updateResult = error;
        break;
      }
      default:
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Acción no válida' } },
          { status: 400 }
        );
    }

    if (updateResult) {
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_ERROR', message: 'Error al actualizar el usuario' } },
        { status: 500 }
      );
    }

    // Log admin action
    await supabase.from('admin_logs').insert({
      admin_id: adminUser.id,
      action,
      entity: 'user',
      entity_id: userId,
      details: { value: value ?? null },
    });

    // Return updated user
    const { data: updatedUser } = await supabase
      .from('users')
      .select('id, email, role, created_at, updated_at')
      .eq('id', userId)
      .single();

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
