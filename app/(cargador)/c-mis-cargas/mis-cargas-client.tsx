'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { TLoad, TLoadStatus } from '@/types/database';
import { LoadCard } from '@/components/shared/load-card';
import { Badge } from '@/components/ui/badge';

interface TLoadWithCount extends TLoad {
  applications: { count: number }[];
}

type TTabFilter = 'todas' | 'activas' | 'completadas' | 'canceladas';

const TABS: { key: TTabFilter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'activas', label: 'Activas' },
  { key: 'completadas', label: 'Completadas' },
  { key: 'canceladas', label: 'Canceladas' },
];

const ACTIVE_STATUSES: TLoadStatus[] = [
  'publicada',
  'aplicada',
  'asignada',
  'en_camino',
];

const COMPLETED_STATUSES: TLoadStatus[] = ['entregada', 'calificada'];

interface TMisCargasClientProps {
  loads: TLoadWithCount[];
}

export function MisCargasClient({ loads }: TMisCargasClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TTabFilter>('todas');

  const filteredLoads = useMemo(() => {
    switch (activeTab) {
      case 'activas':
        return loads.filter((l) =>
          ACTIVE_STATUSES.includes(l.estado),
        );
      case 'completadas':
        return loads.filter((l) =>
          COMPLETED_STATUSES.includes(l.estado),
        );
      case 'canceladas':
        return loads.filter((l) => l.estado === 'cancelada');
      default:
        return loads;
    }
  }, [loads, activeTab]);

  const handleTabChange = useCallback((tab: TTabFilter) => {
    setActiveTab(tab);
  }, []);

  function getApplicationCount(load: TLoadWithCount): number {
    const firstApp = load.applications[0];
    return firstApp?.count ?? 0;
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-navy shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Load list */}
      {filteredLoads.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500">
            No tenés cargas en esta categoría.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLoads.map((load) => {
            const appCount = getApplicationCount(load);
            return (
              <div key={load.id} className="relative">
                <LoadCard
                  load={load}
                  onClick={() => router.push(`/c-mis-cargas/${load.id}`)}
                />
                {appCount > 0 && (
                  <div className="absolute right-3 top-3">
                    <Badge variant="blue">
                      {appCount}{' '}
                      {appCount === 1 ? 'postulante' : 'postulantes'}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
