import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


export const metadata: Metadata = {
  title: 'Detalle de Carga',
};

// This page will fetch real data when Supabase is connected.
// For now, show a placeholder that demonstrates the layout.
export default function CargadorLoadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-24 md:p-6">
      {/* Back button */}
      <Link
        href="/c-mis-cargas"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-navy"
      >
        ← Volver a mis cargas
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-navy">
            Detalle de carga
          </h1>
          <Badge variant="blue">
            Carga #{params.id.slice(0, 8)}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Gestioná las postulaciones y el estado de tu carga
        </p>
      </div>

      {/* Load info placeholder */}
      <Card>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Esta página mostrará los detalles completos de la carga y todas las postulaciones
            recibidas cuando la base de datos esté conectada.
          </p>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-bold text-navy">Lo que vas a ver acá:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>📍 Ruta completa (origen → destino)</li>
              <li>📦 Detalles de la carga (tipo, peso, camión requerido)</li>
              <li>💰 Tarifa ofrecida</li>
              <li>👥 Lista de transportistas postulados</li>
              <li>✅ Botones para aceptar/rechazar postulaciones</li>
              <li>📊 Estado actual de la carga</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Applications section placeholder */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-navy">
          Postulaciones recibidas
        </h2>
        <Card className="text-center">
          <p className="py-8 text-gray-400">
            Las postulaciones aparecerán acá cuando los transportistas se postulen a tu carga.
          </p>
        </Card>
      </div>
    </div>
  );
}
