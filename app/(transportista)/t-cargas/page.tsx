import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Cargas Disponibles | CarGA',
  description: 'Explorá las cargas disponibles en tu zona.',
};

export default function CargasDisponiblesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Cargas Disponibles</h1>
      <Card>
        <p className="text-gray-600">
          Acá vas a encontrar todas las cargas publicadas, con filtros por zona,
          tipo de camión y tarifa.
        </p>
        <p className="mt-4 text-sm font-medium text-gold">
          Próximamente
        </p>
      </Card>
    </div>
  );
}
