import type { Metadata } from 'next';
import Link from 'next/link';
import { getLoadById } from '@/lib/supabase/queries';
import type { TProfileCargador } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  formatARS,
  formatDate,
  formatDistance,
  formatRelativeTime,
} from '@/utils/format';
import {
  CARGO_TYPE_LABELS,
  TRUCK_TYPE_LABELS,
} from '@/utils/constants';

export const metadata: Metadata = {
  title: 'Detalle de Carga | CarGA',
  description: 'Detalle completo de la carga publicada.',
};

type TCargadorPartial = Pick<
  TProfileCargador,
  'id' | 'empresa' | 'contacto_nombre' | 'rating' | 'total_cargas' | 'verified' | 'avatar_url' | 'ciudad' | 'provincia'
>;

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5 text-gold">
      {'★'.repeat(fullStars)}
      {hasHalf && '½'}
      {'☆'.repeat(emptyStars)}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </span>
  );
}

interface TPageProps {
  params: { id: string };
}

export default async function LoadDetailPage({ params }: TPageProps) {
  const { data: loadData, error } = await getLoadById(params.id);

  if (error || !loadData) {
    return (
      <div className="space-y-6">
        <Link
          href="/t-cargas"
          className="inline-flex items-center gap-1 text-sm text-navy hover:underline"
        >
          ← Volver a cargas
        </Link>
        <Card>
          <div className="py-8 text-center">
            <span className="text-4xl">⚠️</span>
            <p className="mt-3 text-sm text-red-600">
              No se pudo encontrar la carga solicitada.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const load = loadData;
  const cargador = (load as Record<string, unknown>).cargador as TCargadorPartial | null;
  const cargoLabel = CARGO_TYPE_LABELS[load.tipo_carga] ?? load.tipo_carga;
  const truckLabel = TRUCK_TYPE_LABELS[load.tipo_camion_requerido] ?? load.tipo_camion_requerido;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back button */}
      <Link
        href="/t-cargas"
        className="inline-flex items-center gap-1 text-sm text-navy hover:underline"
      >
        ← Volver a cargas
      </Link>

      {/* Route header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-navy">
              {load.origen_ciudad} → {load.destino_ciudad}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {load.origen_provincia} → {load.destino_provincia}
            </p>
          </div>
          <StatusBadge status={load.estado} />
        </div>

        {/* Distance + time badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {load.distancia_km != null && (
            <Badge variant="default">{formatDistance(load.distancia_km)}</Badge>
          )}
          <Badge variant="gray">
            Publicada {formatRelativeTime(load.created_at)}
          </Badge>
        </div>
      </div>

      {/* Details card */}
      <Card>
        <h2 className="mb-4 text-lg font-bold text-navy">Detalles de la carga</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-400">
              Tipo de carga
            </dt>
            <dd className="mt-1 text-sm font-medium text-gray-800">{cargoLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-400">Peso</dt>
            <dd className="mt-1 text-sm font-medium text-gray-800">
              {load.peso_tn} tn
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-400">
              Camión requerido
            </dt>
            <dd className="mt-1 text-sm font-medium text-gray-800">{truckLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-400">
              Fecha de carga
            </dt>
            <dd className="mt-1 text-sm font-medium text-gray-800">
              {formatDate(load.fecha_carga)}
            </dd>
          </div>
          {load.fecha_entrega && (
            <div>
              <dt className="text-xs font-semibold uppercase text-gray-400">
                Fecha de entrega
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-800">
                {formatDate(load.fecha_entrega)}
              </dd>
            </div>
          )}
          {load.observaciones && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase text-gray-400">
                Observaciones
              </dt>
              <dd className="mt-1 whitespace-pre-line text-sm text-gray-700">
                {load.observaciones}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Shipper info card */}
      {cargador && (
        <Card>
          <h2 className="mb-4 text-lg font-bold text-navy">Información del cargador</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-800">
                {cargador.empresa}
              </span>
              {cargador.verified && (
                <Badge variant="blue">Verificado</Badge>
              )}
            </div>

            {cargador.rating > 0 && (
              <div>
                <StarRating rating={cargador.rating} />
              </div>
            )}

            <p className="text-sm text-gray-500">
              {cargador.total_cargas}{' '}
              {cargador.total_cargas === 1
                ? 'carga publicada'
                : 'cargas publicadas'}
            </p>

            {cargador.ciudad && cargador.provincia && (
              <p className="text-sm text-gray-500">
                📍 {cargador.ciudad}, {cargador.provincia}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Price section */}
      <Card className="text-center">
        <p className="text-sm text-gray-500">Tarifa ofrecida</p>
        <p className="mt-1 text-3xl font-bold text-brand-green">
          {formatARS(load.tarifa_ars)}
        </p>
        {load.tarifa_negociable && (
          <p className="mt-1 text-sm text-gold">Tarifa negociable</p>
        )}
      </Card>

      {/* Apply button */}
      {load.estado === 'publicada' && (
        <Link href={`/t-cargas/${load.id}/aplicar`} className="block">
          <Button variant="secondary" size="lg" className="w-full">
            Aplicar a esta carga
          </Button>
        </Link>
      )}
    </div>
  );
}
