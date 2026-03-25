import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Mi Perfil | CarGA',
  description: 'Gestioná tu perfil de cargador en CarGA.',
};

export default function CargadorPerfilPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Mi Perfil</h1>
      <Card>
        <p className="text-gray-600">
          Editá los datos de tu empresa, CUIT y preferencias de
          notificación.
        </p>
        <p className="mt-4 text-sm font-medium text-gold">
          Próximamente
        </p>
      </Card>
    </div>
  );
}
