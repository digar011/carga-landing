import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Mis Cargas | CarGA',
  description: 'Gestioná tus cargas publicadas en CarGA.',
};

export default function MisCargasPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Mis Cargas</h1>
      <Card>
        <p className="text-gray-600">
          Acá vas a ver todas tus cargas publicadas, su estado actual y el
          historial completo.
        </p>
        <p className="mt-4 text-sm font-medium text-gold">
          Próximamente
        </p>
      </Card>
    </div>
  );
}
