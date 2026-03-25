'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { TLoad, TProfileCargador } from '@/types/database';
import { LoadCard } from '@/components/shared/load-card';
import { LoadFilters, type TLoadFilterValues } from '@/components/shared/load-filters';
import { EmptyState } from '@/components/shared/empty-state';

interface TLoadWithCargadorPartial extends TLoad {
  cargador?: Pick<TProfileCargador, 'id' | 'empresa' | 'rating' | 'total_cargas' | 'verified' | 'avatar_url'> | null;
}

interface TLoadBoardClientProps {
  initialLoads: TLoadWithCargadorPartial[];
}

const INITIAL_FILTERS: TLoadFilterValues = {
  search: '',
  provincia: '',
  tipo_camion: '',
  sort: 'newest',
};

export function LoadBoardClient({ initialLoads }: TLoadBoardClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<TLoadFilterValues>(INITIAL_FILTERS);

  const handleFilterChange = useCallback((newFilters: TLoadFilterValues) => {
    setFilters(newFilters);
  }, []);

  const filteredLoads = useMemo(() => {
    let result = [...initialLoads];

    // Text search
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (load) =>
          load.origen_ciudad.toLowerCase().includes(term) ||
          load.destino_ciudad.toLowerCase().includes(term) ||
          load.descripcion_carga.toLowerCase().includes(term),
      );
    }

    // Province filter
    if (filters.provincia) {
      result = result.filter(
        (load) =>
          load.origen_provincia === filters.provincia ||
          load.destino_provincia === filters.provincia,
      );
    }

    // Truck type filter
    if (filters.tipo_camion) {
      result = result.filter(
        (load) => load.tipo_camion_requerido === filters.tipo_camion,
      );
    }

    // Sorting
    switch (filters.sort) {
      case 'highest_rate':
        result.sort((a, b) => b.tarifa_ars - a.tarifa_ars);
        break;
      case 'lowest_weight':
        result.sort((a, b) => a.peso_tn - b.peso_tn);
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }

    return result;
  }, [initialLoads, filters]);

  return (
    <>
      <LoadFilters currentFilters={filters} onFilterChange={handleFilterChange} />

      {filteredLoads.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No se encontraron cargas"
          description="Probá cambiando los filtros o buscando en otra zona."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLoads.map((load) => (
            <LoadCard
              key={load.id}
              load={load}
              cargadorInfo={
                load.cargador
                  ? {
                      empresa: load.cargador.empresa,
                      rating: load.cargador.rating,
                      verified: load.cargador.verified,
                    }
                  : undefined
              }
              onClick={() => router.push(`/t-cargas/${load.id}`)}
            />
          ))}
        </div>
      )}
    </>
  );
}
