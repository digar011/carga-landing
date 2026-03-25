import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Mapa de Cargas | CarGA',
  description: 'Visualizá las cargas disponibles en el mapa.',
};

export default function MapaCargasPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Mapa de Cargas</h1>
      <Card>
        <p className="text-gray-600">
          Vas a poder ver en el mapa las cargas disponibles cerca de tu
          ubicación y planificar tus rutas.
        </p>
        <p className="mt-4 text-sm font-medium text-gold">
          Próximamente
        </p>
      </Card>
    </div>
  );
}
