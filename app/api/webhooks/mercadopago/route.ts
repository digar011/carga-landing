import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// ============================================
// Mercado Pago Webhook
// Receives payment and subscription notifications
// TODO: Full implementation in Week 7-8
// ============================================

/**
 * Mercado Pago webhook event types
 */
type TMPWebhookType =
  | 'payment'
  | 'subscription_preapproval'
  | 'subscription_preapproval_plan'
  | 'subscription_authorized_payment'
  | 'point_integration_wh';

interface TMPWebhookPayload {
  id: number;
  live_mode: boolean;
  type: TMPWebhookType;
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

/** Valid Mercado Pago webhook event types */
const VALID_WEBHOOK_TYPES = new Set<string>([
  'payment',
  'subscription_preapproval',
  'subscription_preapproval_plan',
  'subscription_authorized_payment',
  'point_integration_wh',
]);

/**
 * POST — Receive payment/subscription notifications from Mercado Pago
 * Must return 200 quickly — MP retries on failures
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Security: verify the request has expected headers
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    if (!xSignature && !xRequestId) {
      console.error('[MercadoPago Webhook] Sin headers de verificación');
      // In production, reject requests without proper headers
      // For now, log and continue to avoid blocking during development
    }

    const payload = (await request.json()) as TMPWebhookPayload;

    // Validate webhook type
    if (!payload.type || !VALID_WEBHOOK_TYPES.has(payload.type)) {
      console.error('[MercadoPago Webhook] Tipo de evento no reconocido:', payload.type);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    console.info(
      `[MercadoPago Webhook] Evento recibido: ${payload.type} | Action: ${payload.action} | Data ID: ${payload.data?.id} | Live: ${payload.live_mode}`
    );

    switch (payload.type) {
      case 'subscription_preapproval':
        await handleSubscriptionEvent(payload);
        break;

      case 'payment':
        await handlePaymentEvent(payload);
        break;

      case 'subscription_authorized_payment':
        await handleSubscriptionPayment(payload);
        break;

      default:
        console.info(
          `[MercadoPago Webhook] Tipo ${payload.type} recibido — sin handler implementado`
        );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[MercadoPago Webhook] Error procesando payload:', error);
    // Return 200 to prevent infinite retries
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

/**
 * Handle subscription preapproval events (created, updated, cancelled)
 * TODO: Full implementation in Week 7-8
 */
async function handleSubscriptionEvent(payload: TMPWebhookPayload): Promise<void> {
  const subscriptionId = payload.data.id;
  const action = payload.action;

  console.info(
    `[MercadoPago] Suscripción ${subscriptionId} — Acción: ${action}`
  );

  // TODO Week 7-8: Verify subscription status via Mercado Pago API
  // const subscription = await getSubscription(subscriptionId);

  const supabase = createServiceRoleClient();

  // Map MP actions to our subscription states
  const estadoMap: Record<string, string> = {
    'created': 'pendiente',
    'updated': 'activa',
    'cancelled': 'cancelada',
    'paused': 'cancelada',
  };

  const nuevoEstado = estadoMap[action];

  if (!nuevoEstado) {
    console.info(
      `[MercadoPago] Acción de suscripción no mapeada: ${action}`
    );
    return;
  }

  // Update subscription status in database
  const { error } = await supabase
    .from('subscriptions')
    .update({
      estado: nuevoEstado,
      updated_at: new Date().toISOString(),
    })
    .eq('mp_subscription_id', subscriptionId);

  if (error) {
    console.error(
      `[MercadoPago] Error actualizando suscripción ${subscriptionId}:`,
      error.message
    );
  }
}

/**
 * Handle one-time payment events
 * TODO: Full implementation in Week 7-8
 */
async function handlePaymentEvent(payload: TMPWebhookPayload): Promise<void> {
  const paymentId = payload.data.id;

  console.info(
    `[MercadoPago] Pago ${paymentId} — Acción: ${payload.action}`
  );

  // TODO Week 7-8: Verify payment via Mercado Pago API
  // TODO: Update relevant records (featured listings, premium placements, etc.)
}

/**
 * Handle recurring subscription payment events
 * TODO: Full implementation in Week 7-8
 */
async function handleSubscriptionPayment(payload: TMPWebhookPayload): Promise<void> {
  const paymentId = payload.data.id;

  console.info(
    `[MercadoPago] Pago de suscripción ${paymentId} — Acción: ${payload.action}`
  );

  // TODO Week 7-8: Verify payment via Mercado Pago API
  // TODO: Extend subscription end date, send confirmation notification
}
