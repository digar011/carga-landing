import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Panel de Administración | CarGA',
  description: 'Panel de administración de la plataforma CarGA.',
};

export default function AdminPanelPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Panel de Administración</h1>
      <Card>
        <p className="text-gray-600">
          Bienvenido al panel de administración. Desde acá podés gestionar
          usuarios, cargas y ver reportes de la plataforma.
        </p>
        <p className="mt-4 text-sm font-medium text-gold">
          Próximamente
        </p>
      </Card>
    </div>
  );
}
