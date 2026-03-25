import type { Metadata } from 'next';
import { getLoads } from '@/lib/supabase/queries';
import type { TLoad } from '@/types/database';
import { Card } from '@/components/ui/card';
import { MapClient } from './map-client';

export const metadata: Metadata = {
  title: 'Mapa de Cargas | CarGA',
  description: 'Visualizá las cargas disponibles en el mapa y planificá tus rutas.',
};

export default async function MapaCargasPage() {
  const { data, error } = await getLoads({ limit: 200 });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-navy">Mapa de Cargas</h1>
        <Card>
          <div className="py-8 text-center">
            <span className="text-4xl">⚠️</span>
            <p className="mt-3 text-sm text-red-600">
              No se pudieron cargar las cargas disponibles. Intentá de nuevo más tarde.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const loads = (data as TLoad[] | null) ?? [];

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <h1 className="shrink-0 text-2xl font-bold text-navy">Mapa de Cargas</h1>
      <div className="min-h-0 flex-1">
        <MapClient initialLoads={loads} />
      </div>
    </div>
  );
}
