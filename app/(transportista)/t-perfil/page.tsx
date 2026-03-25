import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Mi Perfil | CarGA',
  description: 'Gestioná tu perfil de transportista en CarGA.',
};

export default function TransportistaPerfilPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Mi Perfil</h1>
      <Card>
        <p className="text-gray-600">
          Acá vas a poder editar tus datos, tu CUIT, tipo de camión y
          configurar tus preferencias de notificación.
        </p>
        <p className="mt-4 text-sm font-medium text-gold">
          Próximamente
        </p>
      </Card>
    </div>
  );
}
