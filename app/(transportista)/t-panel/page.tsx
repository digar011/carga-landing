import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Panel del Transportista | CarGA',
  description: 'Panel principal para transportistas en CarGA.',
};

export default function TransportistaPanelPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Panel del Transportista</h1>
      <Card>
        <p className="text-gray-600">
          Bienvenido a tu panel de control. Desde acá vas a poder gestionar tus
          cargas, ver tu mapa de rutas y administrar tu perfil.
        </p>
        <p className="mt-4 text-sm font-medium text-gold">
          Próximamente
        </p>
      </Card>
    </div>
  );
}
