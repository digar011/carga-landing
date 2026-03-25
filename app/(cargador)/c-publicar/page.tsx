import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Publicar Carga | CarGA',
  description: 'Publicá tu carga y encontrá transportistas disponibles.',
};

export default function PublicarCargaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Publicar Carga</h1>
      <Card>
        <p className="text-gray-600">
          Completá los datos de tu carga — origen, destino, peso, tipo y
          tarifa — para encontrar transportistas disponibles.
        </p>
        <p className="mt-4 text-sm font-medium text-gold">
          Próximamente
        </p>
      </Card>
    </div>
  );
}
