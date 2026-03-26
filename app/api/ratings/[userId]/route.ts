import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    // Require authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Debés iniciar sesión para ver calificaciones',
          },
        },
        { status: 401 }
      );
    }

    const { userId } = params;

    // Get all ratings for the user
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('id, score, comentario, created_at, from_user_id')
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false });

    if (ratingsError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'QUERY_ERROR',
            message: 'Error al obtener las calificaciones',
          },
        },
        { status: 500 }
      );
    }

    const total = ratings?.length ?? 0;
    const average =
      total > 0
        ? Number(
            (
              ratings.reduce((sum, r) => sum + r.score, 0) / total
            ).toFixed(1)
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        ratings: ratings ?? [],
        average,
        total,
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
