import { createServerSupabaseClient } from './server';
import type {
  TLoad,
  TLoadStatus,
  TApplicationStatus,
  TTruckType,
  TCargoType,
} from '@/types/database';

// ============================================
// LOADS
// ============================================

export interface TLoadFilters {
  provincia?: string;
  tipo_camion?: TTruckType;
  tipo_carga?: TCargoType;
  peso_min?: number;
  peso_max?: number;
  tarifa_min?: number;
  tarifa_max?: number;
  search?: string;
  sort?: 'newest' | 'highest_rate' | 'lowest_weight';
  limit?: number;
  offset?: number;
}

export async function getLoads(filters: TLoadFilters = {}) {
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from('loads')
    .select(`
      *,
      cargador:profiles_cargador!cargador_id(
        id, empresa, cuit, rating, total_cargas, verified, avatar_url
      )
    `)
    .eq('estado', 'publicada');

  if (filters.provincia) {
    query = query.or(
      `origen_provincia.eq.${filters.provincia},destino_provincia.eq.${filters.provincia}`
    );
  }
  if (filters.tipo_camion) {
    query = query.eq('tipo_camion_requerido', filters.tipo_camion);
  }
  if (filters.tipo_carga) {
    query = query.eq('tipo_carga', filters.tipo_carga);
  }
  if (filters.peso_min) {
    query = query.gte('peso_tn', filters.peso_min);
  }
  if (filters.peso_max) {
    query = query.lte('peso_tn', filters.peso_max);
  }
  if (filters.tarifa_min) {
    query = query.gte('tarifa_ars', filters.tarifa_min);
  }
  if (filters.tarifa_max) {
    query = query.lte('tarifa_ars', filters.tarifa_max);
  }
  if (filters.search) {
    query = query.or(
      `origen_ciudad.ilike.%${filters.search}%,destino_ciudad.ilike.%${filters.search}%,descripcion_carga.ilike.%${filters.search}%`
    );
  }

  // Sorting
  switch (filters.sort) {
    case 'highest_rate':
      query = query.order('tarifa_ars', { ascending: false });
      break;
    case 'lowest_weight':
      query = query.order('peso_tn', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit ?? 20) - 1);
  }

  return query;
}

export async function getLoadById(id: string) {
  const supabase = createServerSupabaseClient();

  return supabase
    .from('loads')
    .select(`
      *,
      cargador:profiles_cargador!cargador_id(
        id, empresa, cuit, contacto_nombre, rating, total_cargas, verified, avatar_url, ciudad, provincia
      )
    `)
    .eq('id', id)
    .single();
}

export async function getLoadsByUser(userId: string) {
  const supabase = createServerSupabaseClient();

  // First get cargador profile id
  const { data: profile } = await supabase
    .from('profiles_cargador')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) return { data: [], error: null };

  return supabase
    .from('loads')
    .select(`
      *,
      applications:load_applications(count)
    `)
    .eq('cargador_id', profile.id)
    .order('created_at', { ascending: false });
}

export async function createLoad(
  cargadorId: string,
  data: Omit<TLoad, 'id' | 'cargador_id' | 'estado' | 'transportista_asignado_id' | 'created_at' | 'updated_at'>
) {
  const supabase = createServerSupabaseClient();

  return supabase
    .from('loads')
    .insert({
      cargador_id: cargadorId,
      ...data,
      estado: 'publicada' as TLoadStatus,
    })
    .select()
    .single();
}

export async function updateLoadStatus(loadId: string, estado: TLoadStatus) {
  const supabase = createServerSupabaseClient();

  return supabase
    .from('loads')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', loadId)
    .select()
    .single();
}

// ============================================
// APPLICATIONS
// ============================================

export async function getApplicationsForLoad(loadId: string) {
  const supabase = createServerSupabaseClient();

  return supabase
    .from('load_applications')
    .select(`
      *,
      transportista:profiles_transportista!transportista_id(
        id, nombre, apellido, cuit, rating, total_viajes, verified, avatar_url, ciudad, provincia,
        trucks(tipo, patente, capacidad_tn, marca, modelo)
      )
    `)
    .eq('load_id', loadId)
    .order('created_at', { ascending: false });
}

export async function createApplication(
  loadId: string,
  transportistaId: string,
  mensaje?: string
) {
  const supabase = createServerSupabaseClient();

  return supabase
    .from('load_applications')
    .insert({
      load_id: loadId,
      transportista_id: transportistaId,
      mensaje: mensaje ?? null,
      estado: 'pendiente' as TApplicationStatus,
    })
    .select()
    .single();
}

export async function updateApplicationStatus(
  applicationId: string,
  estado: TApplicationStatus
) {
  const supabase = createServerSupabaseClient();

  return supabase
    .from('load_applications')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select()
    .single();
}

export async function getApplicationsByTransportista(transportistaId: string) {
  const supabase = createServerSupabaseClient();

  return supabase
    .from('load_applications')
    .select(`
      *,
      load:loads!load_id(
        id, origen_ciudad, origen_provincia, destino_ciudad, destino_provincia,
        tipo_carga, peso_tn, tarifa_ars, estado, fecha_carga
      )
    `)
    .eq('transportista_id', transportistaId)
    .order('created_at', { ascending: false });
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function createNotification(
  userId: string,
  tipo: string,
  titulo: string,
  mensaje: string,
  metadata?: Record<string, unknown>
) {
  const supabase = createServerSupabaseClient();

  return supabase
    .from('notifications')
    .insert({
      user_id: userId,
      tipo,
      titulo,
      mensaje,
      metadata: metadata ?? null,
    });
}
