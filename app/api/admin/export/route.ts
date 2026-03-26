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

function escapeCsvField(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: Record<string, unknown>[], keys: string[]): string {
  const headerLine = headers.map(escapeCsvField).join(',');
  const dataLines = rows.map((row) =>
    keys.map((key) => escapeCsvField(row[key])).join(',')
  );
  return [headerLine, ...dataLines].join('\n');
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
    const type = searchParams.get('type');

    if (!type || !['users', 'loads', 'subscriptions'].includes(type)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Tipo de exportación no válido. Opciones: users, loads, subscriptions' } },
        { status: 400 }
      );
    }

    let csv = '';
    const timestamp = new Date().toISOString().slice(0, 10);

    switch (type) {
      case 'users': {
        const { data, error } = await supabase
          .from('users')
          .select(`
            id, email, role, created_at,
            profile_transportista:profiles_transportista(nombre, apellido, cuit, telefono, provincia, ciudad, verified, plan),
            profile_cargador:profiles_cargador(empresa, cuit, contacto_nombre, contacto_telefono, provincia, ciudad, verified, plan)
          `)
          .order('created_at', { ascending: false })
          .limit(5000);

        if (error) {
          return NextResponse.json(
            { success: false, error: { code: 'QUERY_ERROR', message: 'Error al exportar usuarios' } },
            { status: 500 }
          );
        }

        type TUserExportRow = NonNullable<typeof data>[number];

        const rows = (data ?? []).map((u: TUserExportRow) => {
          const t = Array.isArray(u.profile_transportista) ? u.profile_transportista[0] : u.profile_transportista;
          const c = Array.isArray(u.profile_cargador) ? u.profile_cargador[0] : u.profile_cargador;
          return {
            id: u.id,
            email: u.email,
            role: u.role,
            nombre: t ? `${t.nombre} ${t.apellido}` : c?.empresa ?? '',
            cuit: t?.cuit ?? c?.cuit ?? '',
            telefono: t?.telefono ?? c?.contacto_telefono ?? '',
            provincia: t?.provincia ?? c?.provincia ?? '',
            ciudad: t?.ciudad ?? c?.ciudad ?? '',
            verified: t?.verified ?? c?.verified ?? false,
            plan: t?.plan ?? c?.plan ?? '',
            created_at: u.created_at,
          };
        });

        csv = toCsv(
          ['ID', 'Email', 'Rol', 'Nombre/Empresa', 'CUIT', 'Teléfono', 'Provincia', 'Ciudad', 'Verificado', 'Plan', 'Fecha registro'],
          rows,
          ['id', 'email', 'role', 'nombre', 'cuit', 'telefono', 'provincia', 'ciudad', 'verified', 'plan', 'created_at']
        );
        break;
      }

      case 'loads': {
        const { data, error } = await supabase
          .from('loads')
          .select('id, origen_ciudad, origen_provincia, destino_ciudad, destino_provincia, tipo_carga, peso_tn, tarifa_ars, estado, fecha_carga, created_at')
          .order('created_at', { ascending: false })
          .limit(5000);

        if (error) {
          return NextResponse.json(
            { success: false, error: { code: 'QUERY_ERROR', message: 'Error al exportar cargas' } },
            { status: 500 }
          );
        }

        csv = toCsv(
          ['ID', 'Origen Ciudad', 'Origen Provincia', 'Destino Ciudad', 'Destino Provincia', 'Tipo Carga', 'Peso (tn)', 'Tarifa (ARS)', 'Estado', 'Fecha Carga', 'Fecha Creación'],
          data ?? [],
          ['id', 'origen_ciudad', 'origen_provincia', 'destino_ciudad', 'destino_provincia', 'tipo_carga', 'peso_tn', 'tarifa_ars', 'estado', 'fecha_carga', 'created_at']
        );
        break;
      }

      case 'subscriptions': {
        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            id, user_id, plan, estado, fecha_inicio, fecha_fin, created_at,
            user:users!user_id(email)
          `)
          .order('created_at', { ascending: false })
          .limit(5000);

        if (error) {
          return NextResponse.json(
            { success: false, error: { code: 'QUERY_ERROR', message: 'Error al exportar suscripciones' } },
            { status: 500 }
          );
        }

        type TSubExportRow = NonNullable<typeof data>[number];

        const rows = (data ?? []).map((s: TSubExportRow) => {
          const userRecord = Array.isArray(s.user) ? s.user[0] : s.user;
          return {
            id: s.id,
            email: userRecord?.email ?? '',
            plan: s.plan,
            estado: s.estado,
            fecha_inicio: s.fecha_inicio,
            fecha_fin: s.fecha_fin ?? '',
            created_at: s.created_at,
          };
        });

        csv = toCsv(
          ['ID', 'Email', 'Plan', 'Estado', 'Fecha Inicio', 'Fecha Fin', 'Fecha Creación'],
          rows,
          ['id', 'email', 'plan', 'estado', 'fecha_inicio', 'fecha_fin', 'created_at']
        );
        break;
      }
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="carga-${type}-${timestamp}.csv"`,
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
