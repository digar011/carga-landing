export type TUserRole = 'transportista' | 'cargador' | 'admin';

export type TLoadStatus =
  | 'publicada'
  | 'aplicada'
  | 'asignada'
  | 'en_camino'
  | 'entregada'
  | 'calificada'
  | 'cancelada';

export type TApplicationStatus = 'pendiente' | 'aceptada' | 'rechazada';

export type TTruckType =
  | 'semirremolque'
  | 'volcador'
  | 'frigorifico'
  | 'chasis'
  | 'carrozado'
  | 'tanque'
  | 'portacontenedor'
  | 'batea';

export type TCargoType =
  | 'cereales'
  | 'alimentos'
  | 'maquinaria'
  | 'materiales_construccion'
  | 'productos_quimicos'
  | 'vehiculos'
  | 'ganado'
  | 'general'
  | 'refrigerados'
  | 'peligrosos';

export type TPlan =
  | 'basico'
  | 'profesional'
  | 'flota'
  | 'starter'
  | 'estandar'
  | 'premium'
  | 'enterprise';

export type TNotificationType =
  | 'nueva_carga'
  | 'aplicacion_recibida'
  | 'aplicacion_aceptada'
  | 'aplicacion_rechazada'
  | 'estado_carga'
  | 'nueva_calificacion'
  | 'sistema';

export interface TUser {
  id: string;
  email: string;
  role: TUserRole;
  created_at: string;
  updated_at: string;
}

export interface TProfileTransportista {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  cuit: string;
  telefono: string;
  whatsapp: string | null;
  provincia: string;
  ciudad: string;
  rating: number;
  total_viajes: number;
  verified: boolean;
  plan: TPlan;
  habilitaciones: string[];
  whatsapp_notifications: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TProfileCargador {
  id: string;
  user_id: string;
  empresa: string;
  cuit: string;
  contacto_nombre: string;
  contacto_telefono: string;
  contacto_email: string;
  provincia: string;
  ciudad: string;
  rating: number;
  total_cargas: number;
  verified: boolean;
  plan: TPlan;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TTruck {
  id: string;
  transportista_id: string;
  tipo: TTruckType;
  patente: string;
  capacidad_tn: number;
  marca: string;
  modelo: string;
  anio: number;
  activo: boolean;
  created_at: string;
}

export interface TLoad {
  id: string;
  cargador_id: string;
  origen_lat: number;
  origen_lng: number;
  origen_ciudad: string;
  origen_provincia: string;
  destino_lat: number;
  destino_lng: number;
  destino_ciudad: string;
  destino_provincia: string;
  distancia_km: number | null;
  tipo_carga: TCargoType;
  descripcion_carga: string;
  peso_tn: number;
  tipo_camion_requerido: TTruckType;
  tarifa_ars: number;
  tarifa_negociable: boolean;
  fecha_carga: string;
  fecha_entrega: string | null;
  observaciones: string | null;
  estado: TLoadStatus;
  transportista_asignado_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TLoadApplication {
  id: string;
  load_id: string;
  transportista_id: string;
  mensaje: string | null;
  estado: TApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface TRating {
  id: string;
  from_user_id: string;
  to_user_id: string;
  load_id: string;
  score: number;
  comentario: string | null;
  created_at: string;
}

export interface TNotification {
  id: string;
  user_id: string;
  tipo: TNotificationType;
  titulo: string;
  mensaje: string;
  leida: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TSubscription {
  id: string;
  user_id: string;
  plan: TPlan;
  estado: 'activa' | 'cancelada' | 'vencida' | 'pendiente';
  mp_subscription_id: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  created_at: string;
  updated_at: string;
}

export interface TAdminLog {
  id: string;
  admin_id: string;
  action: string;
  entity: string;
  entity_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

// Joined types for common queries
export interface TLoadWithCargador extends TLoad {
  cargador: TProfileCargador;
}

export interface TLoadWithApplications extends TLoad {
  applications: (TLoadApplication & {
    transportista: TProfileTransportista;
  })[];
}

export interface TLoadApplicationWithDetails extends TLoadApplication {
  load: TLoad;
  transportista: TProfileTransportista;
}
