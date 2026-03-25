import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getLoadsByUser } from '@/lib/supabase/queries';
import type { TLoad } from '@/types/database';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { MisCargasClient } from './mis-cargas-client';

export const metadata: Metadata = {
  title: 'Mis Cargas | CarGA',
  description: 'Gestioná tus cargas publicadas en CarGA.',
};

interface TLoadWithCount extends TLoad {
  applications: { count: number }[];
}

export default async function MisCargasPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-navy">Mis Cargas</h1>
        <Card>
          <div className="py-8 text-center">
            <span className="text-4xl">🔒</span>
            <p className="mt-3 text-sm text-gray-600">
              Debés iniciar sesión para ver tus cargas.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const { data, error } = await getLoadsByUser(user.id);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-navy">Mis Cargas</h1>
        <Card>
          <div className="py-8 text-center">
            <span className="text-4xl">⚠️</span>
            <p className="mt-3 text-sm text-red-600">
              No se pudieron cargar tus cargas. Intentá de nuevo más tarde.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const loads = (data as TLoadWithCount[] | null) ?? [];

  if (loads.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-navy">Mis Cargas</h1>
        <EmptyState
          icon="📦"
          title="Todavía no publicaste ninguna carga"
          description="Publicá tu primera carga y empezá a recibir postulaciones de transportistas verificados."
          action={{ label: 'Publicar carga', href: '/c-publicar' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Mis Cargas</h1>
        <span className="text-sm text-gray-500">
          {loads.length} {loads.length === 1 ? 'carga' : 'cargas'}
        </span>
      </div>

      <MisCargasClient loads={loads} />
    </div>
  );
}
