import type { Metadata } from 'next';
import { getLoads } from '@/lib/supabase/queries';
import type { TLoad, TProfileCargador } from '@/types/database';
import { Card } from '@/components/ui/card';
import { LoadBoardClient } from './load-board-client';

export const metadata: Metadata = {
  title: 'Cargas Disponibles | CarGA',
  description: 'Explorá las cargas disponibles en tu zona.',
};

interface TLoadWithCargadorPartial extends TLoad {
  cargador?: Pick<TProfileCargador, 'id' | 'empresa' | 'rating' | 'total_cargas' | 'verified' | 'avatar_url'> | null;
}

export default async function CargasDisponiblesPage() {
  const { data, error } = await getLoads({ limit: 50 });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-navy">Cargas Disponibles</h1>
        <Card>
          <div className="text-center py-8">
            <span className="text-4xl">⚠️</span>
            <p className="mt-3 text-sm text-red-600">
              No se pudieron cargar las cargas disponibles. Intentá de nuevo más tarde.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const loads = (data as TLoadWithCargadorPartial[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Cargas Disponibles</h1>
        <span className="text-sm text-gray-500">
          {loads.length} {loads.length === 1 ? 'carga disponible' : 'cargas disponibles'}
        </span>
      </div>

      <LoadBoardClient initialLoads={loads} />
    </div>
  );
}
