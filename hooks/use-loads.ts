'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { TLoad, TLoadStatus } from '@/types/database';

interface TUseLoadsFilters {
  provincia?: string;
  tipo_camion?: string;
  tipo_carga?: string;
  search?: string;
  sort?: string;
}

interface TUseLoadsReturn {
  loads: TLoad[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLoads(filters: TUseLoadsFilters = {}): TUseLoadsReturn {
  const [loads, setLoads] = useState<TLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.provincia) params.set('provincia', filters.provincia);
      if (filters.tipo_camion) params.set('tipo_camion', filters.tipo_camion);
      if (filters.tipo_carga) params.set('tipo_carga', filters.tipo_carga);
      if (filters.search) params.set('search', filters.search);
      if (filters.sort) params.set('sort', filters.sort);

      const response = await fetch(`/api/loads?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setLoads(result.data);
      } else {
        setError(result.error?.message ?? 'Error al cargar las cargas');
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [filters.provincia, filters.tipo_camion, filters.tipo_carga, filters.search, filters.sort]);

  useEffect(() => {
    fetchLoads();
  }, [fetchLoads]);

  return { loads, loading, error, refetch: fetchLoads };
}

export function useRealtimeLoads(initialLoads: TLoad[] = []): TLoad[] {
  const [loads, setLoads] = useState<TLoad[]>(initialLoads);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('loads-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'loads',
          filter: 'estado=eq.publicada',
        },
        (payload) => {
          setLoads((prev) => [payload.new as TLoad, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'loads',
        },
        (payload) => {
          const updated = payload.new as TLoad;
          setLoads((prev) =>
            prev
              .map((load) => (load.id === updated.id ? updated : load))
              .filter((load) => load.estado === 'publicada')
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return loads;
}

export function useLoadStatusUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (
    loadId: string,
    estado: TLoadStatus,
    extra?: Record<string, unknown>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/loads/${loadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, ...extra }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message ?? 'Error al actualizar el estado');
        return null;
      }

      return result.data;
    } catch {
      setError('Error de conexión');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading, error };
}
