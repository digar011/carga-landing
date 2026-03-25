import type { TLoad } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatARS, formatRelativeTime, formatDistance } from '@/utils/format';
import {
  TRUCK_TYPE_LABELS,
  CARGO_TYPE_LABELS,
} from '@/utils/constants';

const CARGO_EMOJIS: Record<string, string> = {
  cereales: '\uD83C\uDF3E',
  alimentos: '\uD83C\uDF4E',
  maquinaria: '\u2699\uFE0F',
  materiales_construccion: '\uD83E\uDDF1',
  productos_quimicos: '\u2697\uFE0F',
  vehiculos: '\uD83D\uDE97',
  ganado: '\uD83D\uDC2E',
  general: '\uD83D\uDCE6',
  refrigerados: '\u2744\uFE0F',
  peligrosos: '\u2622\uFE0F',
};

interface TCargadorInfo {
  empresa: string;
  rating: number;
  verified: boolean;
}

interface TLoadCardProps {
  load: TLoad;
  cargadorInfo?: TCargadorInfo;
  onClick?: () => void;
}

function isNewLoad(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const thirtyMinutes = 30 * 60 * 1000;
  return diffMs < thirtyMinutes;
}

export function LoadCard({ load, cargadorInfo, onClick }: TLoadCardProps) {
  const cargoEmoji = CARGO_EMOJIS[load.tipo_carga] ?? '\uD83D\uDCE6';
  const cargoLabel = CARGO_TYPE_LABELS[load.tipo_carga] ?? load.tipo_carga;
  const truckLabel = TRUCK_TYPE_LABELS[load.tipo_camion_requerido] ?? load.tipo_camion_requerido;
  const showNuevo = load.estado === 'publicada' && isNewLoad(load.created_at);

  return (
    <Card
      padding="sm"
      className="group cursor-pointer transition-transform duration-200 hover:scale-[1.02] hover:shadow-md"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Header: Route + Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-navy">
            {load.origen_ciudad} → {load.destino_ciudad}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {load.origen_provincia} → {load.destino_provincia}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {showNuevo && (
            <Badge variant="gold">NUEVO</Badge>
          )}
          <StatusBadge status={load.estado} />
        </div>
      </div>

      {/* Distance badge */}
      {load.distancia_km != null && (
        <div className="mt-2">
          <Badge variant="default">
            {formatDistance(load.distancia_km)}
          </Badge>
        </div>
      )}

      {/* Cargo + Truck info */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
        <span>
          {cargoEmoji} {cargoLabel} &middot; {load.peso_tn} tn
        </span>
        <span className="text-gray-400">|</span>
        <span>{truckLabel}</span>
      </div>

      {/* Price + Time */}
      <div className="mt-3 flex items-end justify-between">
        <span className="text-lg font-bold text-brand-green">
          {formatARS(load.tarifa_ars)}
        </span>
        <span className="text-xs text-gray-400">
          {formatRelativeTime(load.created_at)}
        </span>
      </div>

      {/* Cargador info */}
      {cargadorInfo && (
        <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-2 text-xs text-gray-500">
          <span className="font-medium text-gray-700">{cargadorInfo.empresa}</span>
          {cargadorInfo.verified && (
            <Badge variant="blue" className="text-[10px]">Verificado</Badge>
          )}
          {cargadorInfo.rating > 0 && (
            <span>{'★'} {cargadorInfo.rating.toFixed(1)}</span>
          )}
        </div>
      )}
    </Card>
  );
}
