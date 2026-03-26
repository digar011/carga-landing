import type { TPlan, TUserRole } from '@/types/database';

export interface TPlanDefinition {
  id: TPlan;
  name: string;
  price: number;
  currency: 'ARS';
  role: Extract<TUserRole, 'transportista' | 'cargador'>;
  limits: {
    searches_per_day?: number;
    posts_per_month?: number;
    max_trucks?: number;
  };
  features: string[];
  popular?: boolean;
}

export const PLANS: Record<
  Extract<TPlan, 'basico' | 'profesional' | 'flota' | 'starter' | 'estandar' | 'premium'>,
  TPlanDefinition
> = {
  basico: {
    id: 'basico',
    name: 'Básico',
    price: 0,
    currency: 'ARS',
    role: 'transportista',
    limits: { searches_per_day: 3 },
    features: ['3 búsquedas por día', 'Perfil básico'],
  },
  profesional: {
    id: 'profesional',
    name: 'Profesional',
    price: 13500,
    currency: 'ARS',
    role: 'transportista',
    limits: { searches_per_day: -1 },
    features: ['Búsquedas ilimitadas', 'Alertas WhatsApp', 'Perfil verificado'],
    popular: true,
  },
  flota: {
    id: 'flota',
    name: 'Flota',
    price: 33750,
    currency: 'ARS',
    role: 'transportista',
    limits: { searches_per_day: -1, max_trucks: 10 },
    features: ['Hasta 10 unidades', 'Panel de flota', 'Soporte prioritario'],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    currency: 'ARS',
    role: 'cargador',
    limits: { posts_per_month: 3 },
    features: ['3 publicaciones por mes', 'Perfil básico'],
  },
  estandar: {
    id: 'estandar',
    name: 'Estándar',
    price: 20250,
    currency: 'ARS',
    role: 'cargador',
    limits: { posts_per_month: 20 },
    features: ['20 publicaciones por mes', 'Analíticas básicas'],
    popular: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 47250,
    currency: 'ARS',
    role: 'cargador',
    limits: { posts_per_month: -1 },
    features: ['Publicaciones ilimitadas', 'Cargas destacadas', 'Soporte prioritario'],
  },
} as const;

type TPlanAction = 'search' | 'post' | 'add_truck';

/**
 * Check whether a user on the given plan can perform an action.
 * `currentCount` is the number of times the action has already been used in the period.
 * A limit of -1 means unlimited.
 */
export function checkPlanLimit(
  plan: TPlan,
  action: TPlanAction,
  currentCount: number,
): { allowed: boolean; message: string } {
  const planDef = PLANS[plan as keyof typeof PLANS] as TPlanDefinition | undefined;

  if (!planDef) {
    return { allowed: false, message: 'Plan no encontrado.' };
  }

  let limit: number | undefined;
  let limitLabel: string;

  switch (action) {
    case 'search':
      limit = planDef.limits.searches_per_day;
      limitLabel = 'búsquedas por día';
      break;
    case 'post':
      limit = planDef.limits.posts_per_month;
      limitLabel = 'publicaciones por mes';
      break;
    case 'add_truck':
      limit = planDef.limits.max_trucks;
      limitLabel = 'unidades';
      break;
    default:
      return { allowed: false, message: 'Acción no reconocida.' };
  }

  if (limit === undefined) {
    return { allowed: false, message: 'Tu plan no incluye esta funcionalidad.' };
  }

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, message: 'Sin límite.' };
  }

  if (currentCount >= limit) {
    return {
      allowed: false,
      message: `Alcanzaste el límite de ${limit} ${limitLabel}. Mejorá tu plan para continuar.`,
    };
  }

  return {
    allowed: true,
    message: `${currentCount + 1} de ${limit} ${limitLabel}.`,
  };
}

/**
 * Return the plans available for a given role.
 */
export function getPlansForRole(
  role: Extract<TUserRole, 'transportista' | 'cargador'>,
): TPlanDefinition[] {
  return Object.values(PLANS).filter((plan) => plan.role === role);
}

/**
 * Format a plan price for display.
 * Returns "Gratis" for free plans, "$XX.XXX/mes" for paid plans.
 */
export function formatPlanPrice(price: number): string {
  if (price === 0) return 'Gratis';

  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return `${formatted}/mes`;
}
