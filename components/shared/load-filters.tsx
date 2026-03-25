'use client';

import { useState, useCallback, type ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PROVINCIAS, TRUCK_TYPE_LABELS } from '@/utils/constants';

export interface TLoadFilterValues {
  search: string;
  provincia: string;
  tipo_camion: string;
  sort: 'newest' | 'highest_rate' | 'lowest_weight';
}

interface TLoadFiltersProps {
  currentFilters: TLoadFilterValues;
  onFilterChange: (filters: TLoadFilterValues) => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'highest_rate', label: 'Mayor tarifa' },
  { value: 'lowest_weight', label: 'Menor peso' },
] as const;

const INITIAL_FILTERS: TLoadFilterValues = {
  search: '',
  provincia: '',
  tipo_camion: '',
  sort: 'newest',
};

export function LoadFilters({ currentFilters, onFilterChange }: TLoadFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const updateFilter = useCallback(
    <K extends keyof TLoadFilterValues>(key: K, value: TLoadFilterValues[K]) => {
      onFilterChange({ ...currentFilters, [key]: value });
    },
    [currentFilters, onFilterChange],
  );

  const clearFilters = useCallback(() => {
    onFilterChange(INITIAL_FILTERS);
  }, [onFilterChange]);

  const hasActiveFilters =
    currentFilters.search !== '' ||
    currentFilters.provincia !== '' ||
    currentFilters.tipo_camion !== '' ||
    currentFilters.sort !== 'newest';

  const truckTypes = Object.entries(TRUCK_TYPE_LABELS);

  return (
    <div className="space-y-3">
      {/* Search + Mobile toggle */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Buscar por ciudad o carga..."
          value={currentFilters.search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateFilter('search', e.target.value)
          }
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          className="md:hidden"
          onClick={() => setExpanded((prev) => !prev)}
        >
          Filtros
        </Button>
      </div>

      {/* Filter panel (always visible on md+, collapsible on mobile) */}
      <div
        className={`space-y-3 ${expanded ? 'block' : 'hidden'} md:block`}
      >
        {/* Province select */}
        <Select
          value={currentFilters.provincia}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            updateFilter('provincia', e.target.value)
          }
        >
          <option value="">Todas las provincias</option>
          {PROVINCIAS.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </Select>

        {/* Truck type chips */}
        <div className="flex flex-wrap gap-2">
          {truckTypes.map(([key, label]) => {
            const isActive = currentFilters.tipo_camion === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateFilter('tipo_camion', isActive ? '' : key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-navy bg-navy text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-navy hover:text-navy'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Sort + Clear */}
        <div className="flex items-center gap-2">
          <Select
            value={currentFilters.sort}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              updateFilter('sort', e.target.value as TLoadFilterValues['sort'])
            }
            className="flex-1"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
