import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Reportes | CarGA',
  description: 'Reportes y métricas de la plataforma CarGA.',
};

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Reportes</h1>
      <Card>
        <p className="text-gray-600">
          Acá vas a encontrar métricas de uso, volumen de cargas, actividad
          de usuarios y otros reportes clave de la plataforma.
        </p>
        <p className="mt-4 text-sm font-medium text-gold">
          Próximamente
        </p>
      </Card>
    </div>
  );
}
