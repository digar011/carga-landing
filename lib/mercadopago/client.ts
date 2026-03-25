// Mercado Pago API client scaffold
// Configure with MERCADOPAGO_ACCESS_TOKEN environment variable

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const BASE_URL = 'https://api.mercadopago.com';

interface TCreateSubscriptionParams {
  planId: string;
  payerEmail: string;
  externalReference: string;
}

interface TSubscriptionResponse {
  id: string;
  status: string;
  init_point: string;
}

async function mpFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!ACCESS_TOKEN) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Mercado Pago error: ${JSON.stringify(errorData)}`);
  }

  return response.json() as Promise<T>;
}

export async function createSubscription(
  params: TCreateSubscriptionParams
): Promise<TSubscriptionResponse> {
  return mpFetch<TSubscriptionResponse>('/preapproval', {
    method: 'POST',
    body: JSON.stringify({
      preapproval_plan_id: params.planId,
      payer_email: params.payerEmail,
      external_reference: params.externalReference,
      status: 'authorized',
    }),
  });
}

export async function getSubscription(subscriptionId: string): Promise<TSubscriptionResponse> {
  return mpFetch<TSubscriptionResponse>(`/preapproval/${subscriptionId}`);
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await mpFetch(`/preapproval/${subscriptionId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'cancelled' }),
  });
}

// Plan price mapping (ARS)
export const PLAN_PRICES = {
  // Transportista plans
  profesional: { amount: 13500, currency: 'ARS', interval: 'monthly' },
  flota: { amount: 33750, currency: 'ARS', interval: 'monthly' },
  // Cargador plans
  estandar: { amount: 20250, currency: 'ARS', interval: 'monthly' },
  premium: { amount: 47250, currency: 'ARS', interval: 'monthly' },
} as const;
