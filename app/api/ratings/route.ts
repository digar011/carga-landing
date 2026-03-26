import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ratingSchema } from '@/utils/validations';

const createRatingSchema = ratingSchema.extend({
  load_id: z.string().uuid('ID de carga inválido'),
  to_user_id: z.string().uuid('ID de usuario inválido'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

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
            message: 'Debés iniciar sesión para calificar',
          },
        },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parsed = createRatingSchema.safeParse(body);

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

    const { load_id, to_user_id, score, comentario } = parsed.data;

    // Verify user is not rating themselves
    if (to_user_id === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SELF_RATING',
            message: 'No podés calificarte a vos mismo',
          },
        },
        { status: 400 }
      );
    }

    // Verify load exists and is in 'entregada' status
    const { data: load, error: loadError } = await supabase
      .from('loads')
      .select('id, estado')
      .eq('id', load_id)
      .single();

    if (loadError || !load) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LOAD_NOT_FOUND',
            message: 'Carga no encontrada',
          },
        },
        { status: 404 }
      );
    }

    if (load.estado !== 'entregada') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LOAD_NOT_DELIVERED',
            message:
              'Solo podés calificar cargas que hayan sido entregadas',
          },
        },
        { status: 400 }
      );
    }

    // Check if user already rated for this load
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('from_user_id', user.id)
      .eq('load_id', load_id)
      .maybeSingle();

    if (existingRating) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_RATED',
            message: 'Ya calificaste a este usuario para esta carga',
          },
        },
        { status: 409 }
      );
    }

    // Insert rating — DB trigger auto-updates profile average
    const { data: rating, error: insertError } = await supabase
      .from('ratings')
      .insert({
        from_user_id: user.id,
        to_user_id,
        load_id,
        score,
        comentario: comentario ?? null,
      })
      .select()
      .single();

    if (insertError) {
      // Handle unique constraint violation as friendly error
      if (insertError.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ALREADY_RATED',
              message: 'Ya calificaste a este usuario para esta carga',
            },
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSERT_ERROR',
            message: 'Error al guardar la calificación',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: rating }, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
