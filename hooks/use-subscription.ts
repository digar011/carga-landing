'use client';

import { useCallback, useEffect, useState } from 'react';
import type { TPlan, TSubscription } from '@/types/database';
import { PLANS, type TPlanDefinition } from '@/lib/subscriptions/plans';

interface TSubscribeResult {
  checkout_url: string;
}

interface TUseSubscriptionReturn {
  subscription: TSubscription | null;
  plan: TPlanDefinition | null;
  loading: boolean;
  error: string | null;
  subscribe: (plan: TPlan) => Promise<TSubscribeResult | null>;
  cancel: () => Promise<boolean>;
}

export function useSubscription(): TUseSubscriptionReturn {
  const [subscription, setSubscription] = useState<TSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscriptions');
      const result = await response.json();

      if (result.success) {
        setSubscription(result.data);
      } else {
        setError(result.error?.message ?? 'Error al cargar la suscripción.');
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const subscribe = useCallback(
    async (planId: TPlan): Promise<TSubscribeResult | null> => {
      setError(null);

      try {
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planId }),
        });

        const result = await response.json();

        if (result.success) {
          return result.data as TSubscribeResult;
        }

        setError(result.error?.message ?? 'Error al crear la suscripción.');
        return null;
      } catch {
        setError('Error de conexión. Intentá de nuevo.');
        return null;
      }
    },
    [],
  );

  const cancel = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      setError('No tenés una suscripción activa.');
      return false;
    }

    setError(null);

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PATCH',
      });

      const result = await response.json();

      if (result.success) {
        setSubscription((prev) =>
          prev ? { ...prev, estado: 'cancelada', fecha_fin: new Date().toISOString() } : null,
        );
        return true;
      }

      setError(result.error?.message ?? 'Error al cancelar la suscripción.');
      return false;
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
      return false;
    }
  }, [subscription]);

  // Resolve the plan definition for the current subscription
  const currentPlan: TPlanDefinition | null =
    subscription?.plan && subscription.plan in PLANS
      ? PLANS[subscription.plan as keyof typeof PLANS]
      : null;

  return {
    subscription,
    plan: currentPlan,
    loading,
    error,
    subscribe,
    cancel,
  };
}
