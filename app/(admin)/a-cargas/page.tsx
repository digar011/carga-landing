import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Gestión de Cargas | CarGA',
  description: 'Administrá todas las cargas publicadas en la plataforma.',
};

export default function AdminCargasPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Gestión de Cargas</h1>
      <Card>
        <p className="text-gray-600">
          Revisá, moderá y gestioná todas las cargas publicadas en la
          plataforma.
        </p>
        <p className="mt-4 text-sm font-medium text-gold">
          Próximamente
        </p>
      </Card>
    </div>
  );
}
