// Argentine provinces
export const PROVINCIAS = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
] as const;

// Truck type labels (Spanish)
export const TRUCK_TYPE_LABELS: Record<string, string> = {
  semirremolque: 'Semirremolque',
  volcador: 'Volcador',
  frigorifico: 'Frigorífico',
  chasis: 'Chasis',
  carrozado: 'Carrozado',
  tanque: 'Tanque',
  portacontenedor: 'Portacontenedor',
  batea: 'Batea',
};

// Cargo type labels (Spanish)
export const CARGO_TYPE_LABELS: Record<string, string> = {
  cereales: 'Cereales',
  alimentos: 'Alimentos',
  maquinaria: 'Maquinaria',
  materiales_construccion: 'Materiales de construcción',
  productos_quimicos: 'Productos químicos',
  vehiculos: 'Vehículos',
  ganado: 'Ganado',
  general: 'Carga general',
  refrigerados: 'Refrigerados',
  peligrosos: 'Carga peligrosa',
};

// Load status labels (Spanish)
export const LOAD_STATUS_LABELS: Record<string, string> = {
  publicada: 'Publicada',
  aplicada: 'Con postulantes',
  asignada: 'Asignada',
  en_camino: 'En camino',
  entregada: 'Entregada',
  calificada: 'Calificada',
  cancelada: 'Cancelada',
};

// Load status colors for badges
export const LOAD_STATUS_COLORS: Record<string, string> = {
  publicada: 'green',
  aplicada: 'blue',
  asignada: 'gold',
  en_camino: 'blue',
  entregada: 'green',
  calificada: 'gray',
  cancelada: 'red',
};

// Plan labels
export const PLAN_LABELS: Record<string, string> = {
  basico: 'Básico',
  profesional: 'Profesional',
  flota: 'Flota',
  starter: 'Starter',
  estandar: 'Estándar',
  premium: 'Premium',
  enterprise: 'Enterprise',
};

// Free tier limits
export const FREE_TIER_LIMITS = {
  transportista_searches_per_day: 3,
  cargador_posts_per_month: 3,
} as const;
