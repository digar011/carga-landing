'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatARS } from '@/utils/format';

type TPaymentStatus = 'approved' | 'pending' | 'rejected';

export interface TPayment {
  id: string;
  date: string;
  plan: string;
  amount: number;
  status: TPaymentStatus;
}

interface TPaymentHistoryProps {
  payments: TPayment[];
}

const STATUS_CONFIG: Record<TPaymentStatus, { label: string; variant: 'green' | 'gold' | 'red' }> = {
  approved: { label: 'Aprobado', variant: 'green' },
  pending: { label: 'Pendiente', variant: 'gold' },
  rejected: { label: 'Rechazado', variant: 'red' },
};

function formatPaymentDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function PaymentHistory({ payments }: TPaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <Card padding="lg">
        <div className="flex flex-col items-center py-8 text-center">
          <span className="text-4xl" role="img" aria-label="Sin pagos">
            &#x1F4B3;
          </span>
          <p className="mt-4 text-sm text-gray-500">No tenés pagos registrados todavía.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-navy">Fecha</th>
              <th className="px-4 py-3 font-semibold text-navy">Plan</th>
              <th className="px-4 py-3 font-semibold text-navy">Monto</th>
              <th className="px-4 py-3 font-semibold text-navy">Estado</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => {
              const statusConfig = STATUS_CONFIG[payment.status];
              return (
                <tr key={payment.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-gray-700">
                    {formatPaymentDate(payment.date)}
                  </td>
                  <td className="px-4 py-3 font-medium text-navy">{payment.plan}</td>
                  <td className="px-4 py-3 text-gray-700">{formatARS(payment.amount)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
