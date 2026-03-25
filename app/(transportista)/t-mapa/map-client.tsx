'use client';

import { useCallback, useState } from 'react';
import type { TLoad } from '@/types/database';
import { useRealtimeLoads } from '@/hooks/use-loads';
import { MapView } from '@/components/shared/map-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatARS, formatDate } from '@/utils/format';
import { CARGO_TYPE_LABELS, TRUCK_TYPE_LABELS } from '@/utils/constants';

interface TMapClientProps {
  initialLoads: TLoad[];
}

export function MapClient({ initialLoads }: TMapClientProps) {
  const loads = useRealtimeLoads(initialLoads);
  const [selectedLoad, setSelectedLoad] = useState<TLoad | null>(null);
  const [filterTruckType, setFilterTruckType] = useState<string>('');

  const handleLoadSelect = useCallback((load: TLoad) => {
    setSelectedLoad(load);
  }, []);

  const filteredLoads = filterTruckType
    ? loads.filter((load) => load.tipo_camion_requerido === filterTruckType)
    : loads;

  const handleCloseDetail = useCallback(() => {
    setSelectedLoad(null);
  }, []);

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      {/* Map area */}
      <div className="flex flex-1 flex-col gap-3">
        {/* Truck type filter */}
        <div className="flex items-center gap-3">
          <label htmlFor="filter-truck" className="text-sm font-medium text-gray-700">
            Tipo de camión:
          </label>
          <select
            id="filter-truck"
            value={filterTruckType}
            onChange={(e) => setFilterTruckType(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="">Todos</option>
            {Object.entries(TRUCK_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <span className="ml-auto text-xs text-gray-500">
            {filteredLoads.length} {filteredLoads.length === 1 ? 'carga' : 'cargas'}
          </span>
        </div>

        {/* Map */}
        <div className="flex-1" style={{ minHeight: '500px' }}>
          <MapView loads={filteredLoads} onLoadSelect={handleLoadSelect} />
        </div>
      </div>

      {/* Side panel (desktop) / Bottom sheet (mobile) */}
      {selectedLoad && (
        <LoadDetailPanel load={selectedLoad} onClose={handleCloseDetail} />
      )}
    </div>
  );
}

// --------------------------------------------------
// Load detail side panel / bottom sheet
// --------------------------------------------------

interface TLoadDetailPanelProps {
  load: TLoad;
  onClose: () => void;
}

function LoadDetailPanel({ load, onClose }: TLoadDetailPanelProps) {
  const cargoLabel = CARGO_TYPE_LABELS[load.tipo_carga] ?? load.tipo_carga;
  const truckLabel = TRUCK_TYPE_LABELS[load.tipo_camion_requerido] ?? load.tipo_camion_requerido;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 max-h-[60vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl lg:static lg:inset-auto lg:z-auto lg:max-h-none lg:w-80 lg:rounded-lg lg:shadow-md">
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 lg:rounded-t-lg">
        <h3 className="text-sm font-bold text-navy">Detalle de Carga</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Cerrar detalle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4 p-4">
        {/* Route */}
        <div>
          <p className="text-base font-bold text-navy">
            {load.origen_ciudad} → {load.destino_ciudad}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {load.origen_provincia} → {load.destino_provincia}
          </p>
          {load.distancia_km != null && (
            <Badge variant="default" className="mt-1">
              {load.distancia_km.toLocaleString('es-AR')} km
            </Badge>
          )}
        </div>

        {/* Price */}
        <Card padding="sm" className="bg-green-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tarifa</span>
            <span className="text-lg font-bold text-brand-green">
              {formatARS(load.tarifa_ars)}
            </span>
          </div>
          {load.tarifa_negociable && (
            <p className="mt-1 text-xs text-gray-500">Negociable</p>
          )}
        </Card>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <DetailRow label="Tipo de carga" value={cargoLabel} />
          <DetailRow label="Peso" value={`${load.peso_tn} tn`} />
          <DetailRow label="Camión requerido" value={truckLabel} />
          <DetailRow label="Fecha de carga" value={formatDate(load.fecha_carga)} />
          {load.fecha_entrega && (
            <DetailRow label="Fecha de entrega" value={formatDate(load.fecha_entrega)} />
          )}
        </div>

        {/* Description */}
        {load.descripcion_carga && (
          <div>
            <p className="text-xs font-medium text-gray-500">Descripción</p>
            <p className="mt-1 text-sm text-gray-700">{load.descripcion_carga}</p>
          </div>
        )}

        {/* Observations */}
        {load.observaciones && (
          <div>
            <p className="text-xs font-medium text-gray-500">Observaciones</p>
            <p className="mt-1 text-sm text-gray-700">{load.observaciones}</p>
          </div>
        )}

        {/* CTA */}
        <a
          href={`/t-cargas/${load.id}`}
          className="block w-full rounded-lg bg-gold px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          Ver detalle completo
        </a>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
