'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatPlanPrice, type TPlanDefinition } from '@/lib/subscriptions/plans';

interface TPlanCardProps {
  plan: TPlanDefinition;
  isCurrent: boolean;
  onSelect: (plan: TPlanDefinition) => void;
  loading: boolean;
}

export function PlanCard({ plan, isCurrent, onSelect, loading }: TPlanCardProps) {
  const isFree = plan.price === 0;

  return (
    <Card
      className={`relative flex flex-col ${
        isCurrent ? 'border-2 border-navy ring-2 ring-navy/20' : 'border border-gray-200'
      }`}
      padding="lg"
    >
      {/* Badges */}
      <div className="mb-4 flex items-center gap-2">
        {isCurrent && <Badge variant="default">Plan actual</Badge>}
        {plan.popular && !isCurrent && <Badge variant="gold">Más popular</Badge>}
      </div>

      {/* Plan name */}
      <h3 className="text-xl font-bold text-navy">{plan.name}</h3>

      {/* Price */}
      <p className={`mt-2 text-2xl font-extrabold ${isFree ? 'text-gray-500' : 'text-gold'}`}>
        {formatPlanPrice(plan.price)}
      </p>

      {/* Features */}
      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-0.5 shrink-0 text-brand-green" aria-hidden="true">
              &#x2705;
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-8">
        {isCurrent ? (
          <p className="text-center text-sm font-medium text-navy">Tu plan actual</p>
        ) : isFree ? null : (
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => onSelect(plan)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                Procesando...
              </>
            ) : (
              'Elegir plan'
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
