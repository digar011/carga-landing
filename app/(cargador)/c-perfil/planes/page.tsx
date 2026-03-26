'use client';

import { useState } from 'react';
import { PlanCard } from '@/components/shared/plan-card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useSubscription } from '@/hooks/use-subscription';
import { getPlansForRole, type TPlanDefinition } from '@/lib/subscriptions/plans';

const cargadorPlans = getPlansForRole('cargador');

export default function CargadorPlanesPage() {
  const { subscription, loading, error, subscribe, cancel } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const currentPlanId = subscription?.estado === 'activa' ? subscription.plan : 'starter';

  async function handleSelect(plan: TPlanDefinition) {
    setSelectedPlan(plan.id);

    const result = await subscribe(plan.id);

    if (result?.checkout_url) {
      window.location.href = result.checkout_url;
    }

    setSelectedPlan(null);
  }

  async function handleCancel() {
    setCancelling(true);
    await cancel();
    setCancelling(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-navy">Planes y Precios</h1>
        <p className="mt-2 text-gray-500">
          Elegí el plan que mejor se adapte a tus necesidades como cargador.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {cargadorPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={currentPlanId === plan.id}
            onSelect={handleSelect}
            loading={selectedPlan === plan.id}
          />
        ))}
      </div>

      {/* Cancel current paid subscription */}
      {subscription?.estado === 'activa' && subscription.plan !== 'starter' && (
        <div className="mt-10 text-center">
          <p className="mb-3 text-sm text-gray-500">
            Si cancelás tu plan, vas a volver al plan Starter al final del período de facturación.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Spinner size="sm" />
                Cancelando...
              </>
            ) : (
              'Cancelar plan'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
