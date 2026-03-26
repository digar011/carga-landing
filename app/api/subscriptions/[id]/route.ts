import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cancelSubscription } from '@/lib/mercadopago/client';
import type { TSubscription } from '@/types/database';

interface TRouteParams {
  params: { id: string };
}

/**
 * PATCH /api/subscriptions/[id] — Cancel a subscription
 */
export async function PATCH(_request: NextRequest, { params }: TRouteParams) {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Debés iniciar sesión.' } },
      { status: 401 },
    );
  }

  const { id } = params;

  // Fetch the subscription and verify ownership
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !subscription) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Suscripción no encontrada.' } },
      { status: 404 },
    );
  }

  const sub = subscription as TSubscription;

  if (sub.user_id !== user.id) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'No tenés permiso para cancelar esta suscripción.' } },
      { status: 403 },
    );
  }

  if (sub.estado === 'cancelada') {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'La suscripción ya está cancelada.' } },
      { status: 400 },
    );
  }

  // Cancel in Mercado Pago
  if (sub.mp_subscription_id) {
    try {
      await cancelSubscription(sub.mp_subscription_id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar en Mercado Pago.';
      return NextResponse.json(
        { success: false, error: { code: 'MP_ERROR', message } },
        { status: 502 },
      );
    }
  }

  // Update DB status
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      estado: 'cancelada',
      fecha_fin: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: 'Error al actualizar la suscripción.' } },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: { id, estado: 'cancelada' } });
}
