import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateCuit, formatCuit } from '@/lib/afip/cuit';

const verifyCuitSchema = z.object({
  cuit: z.string().min(1, 'Ingresá un CUIT'),
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
            message: 'Debés iniciar sesión para verificar tu CUIT',
          },
        },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parsed = verifyCuitSchema.safeParse(body);

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

    const { cuit } = parsed.data;
    const result = await validateCuit(cuit);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CUIT_INVALID',
            message: result.error ?? 'CUIT inválido',
          },
        },
        { status: 400 }
      );
    }

    const formattedCuit = formatCuit(cuit);

    // Try updating transportista profile first
    const { data: transportista } = await supabase
      .from('profiles_transportista')
      .update({ verified: true, cuit: formattedCuit })
      .eq('user_id', user.id)
      .select('id')
      .maybeSingle();

    // If not transportista, try cargador profile
    if (!transportista) {
      const { error: cargadorError } = await supabase
        .from('profiles_cargador')
        .update({ verified: true, cuit: formattedCuit })
        .eq('user_id', user.id)
        .select('id')
        .maybeSingle();

      if (cargadorError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PROFILE_NOT_FOUND',
              message: 'No se encontró tu perfil',
            },
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        razonSocial: result.razonSocial,
        estadoClave: result.estadoClave,
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
