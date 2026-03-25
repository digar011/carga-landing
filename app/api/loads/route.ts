import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { loadSchema } from '@/utils/validations';
import { getLoads, type TLoadFilters } from '@/lib/supabase/queries';
import type { TTruckType, TCargoType } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters: TLoadFilters = {};

    const provincia = searchParams.get('provincia');
    if (provincia) filters.provincia = provincia;

    const tipoCamion = searchParams.get('tipo_camion');
    if (tipoCamion) filters.tipo_camion = tipoCamion as TTruckType;

    const tipoCarga = searchParams.get('tipo_carga');
    if (tipoCarga) filters.tipo_carga = tipoCarga as TCargoType;

    const pesoMin = searchParams.get('peso_min');
    if (pesoMin) filters.peso_min = Number(pesoMin);

    const pesoMax = searchParams.get('peso_max');
    if (pesoMax) filters.peso_max = Number(pesoMax);

    const tarifaMin = searchParams.get('tarifa_min');
    if (tarifaMin) filters.tarifa_min = Number(tarifaMin);

    const tarifaMax = searchParams.get('tarifa_max');
    if (tarifaMax) filters.tarifa_max = Number(tarifaMax);

    const search = searchParams.get('search');
    if (search) filters.search = search;

    const sort = searchParams.get('sort');
    if (sort) filters.sort = sort as TLoadFilters['sort'];

    const limit = searchParams.get('limit');
    filters.limit = limit ? Number(limit) : 20;

    const offset = searchParams.get('offset');
    filters.offset = offset ? Number(offset) : 0;

    const { data, error, count } = await getLoads(filters);

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'QUERY_ERROR', message: 'Error al obtener las cargas' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        total: count ?? data?.length ?? 0,
        limit: filters.limit,
        offset: filters.offset,
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

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Debés iniciar sesión para publicar una carga' } },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parsed = loadSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError?.message ?? 'Datos inválidos',
          },
        },
        { status: 400 }
      );
    }

    // Get cargador profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles_cargador')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Solo los cargadores pueden publicar cargas' } },
        { status: 403 }
      );
    }

    const { data: load, error: insertError } = await supabase
      .from('loads')
      .insert({
        cargador_id: profile.id,
        ...parsed.data,
        estado: 'publicada' as const,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: { code: 'INSERT_ERROR', message: 'Error al crear la carga' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: load }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
