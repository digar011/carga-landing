import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSubscription } from '@/lib/mercadopago/client';
import { PLANS, type TPlanDefinition } from '@/lib/subscriptions/plans';
import type { TPlan, TSubscription } from '@/types/database';

/**
 * GET /api/subscriptions — Get current user's subscription
 */
export async function GET() {
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

  const { data: subscription, error: dbError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (dbError) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: 'Error al obtener la suscripción.' } },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: subscription as TSubscription | null });
}

// Valid paid plans grouped by role
const VALID_PAID_PLANS: Record<string, TPlan[]> = {
  transportista: ['profesional', 'flota'],
  cargador: ['estandar', 'premium'],
};

/**
 * POST /api/subscriptions — Create a new subscription
 */
export async function POST(request: NextRequest) {
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

  // Parse body
  let body: { plan?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Cuerpo de solicitud inválido.' } },
      { status: 400 },
    );
  }

  const { plan } = body;

  if (!plan) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'El campo "plan" es obligatorio.' } },
      { status: 400 },
    );
  }

  // Get user profile to determine role
  const { data: transportista } = await supabase
    .from('profile_transportistas')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const userRole = transportista ? 'transportista' : 'cargador';

  // Validate the plan is valid for this role
  const allowedPlans = VALID_PAID_PLANS[userRole];
  if (!allowedPlans || !allowedPlans.includes(plan as TPlan)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: `El plan "${plan}" no es válido para tu rol (${userRole}).`,
        },
      },
      { status: 400 },
    );
  }

  const planDef: TPlanDefinition | undefined = PLANS[plan as keyof typeof PLANS];
  if (!planDef) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Plan no encontrado.' } },
      { status: 400 },
    );
  }

  // Create Mercado Pago subscription
  let mpSubscription;
  try {
    mpSubscription = await createSubscription({
      planId: planDef.id,
      payerEmail: user.email ?? '',
      externalReference: `${user.id}_${planDef.id}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear la suscripción en Mercado Pago.';
    return NextResponse.json(
      { success: false, error: { code: 'MP_ERROR', message } },
      { status: 502 },
    );
  }

  // Insert subscription record in DB
  const subscriptionRecord = {
    user_id: user.id,
    plan: planDef.id,
    estado: 'pendiente' as const,
    mp_subscription_id: mpSubscription.id,
    fecha_inicio: new Date().toISOString(),
  };

  const { error: insertError } = await supabase
    .from('subscriptions')
    .insert(subscriptionRecord);

  if (insertError) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: 'Error al guardar la suscripción.' } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: { checkout_url: mpSubscription.init_point },
  });
}
