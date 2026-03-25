-- Migration: Create all custom enum types
-- Description: Defines domain-specific enums for the Carga platform

CREATE TYPE user_role AS ENUM ('transportista', 'cargador', 'admin');

CREATE TYPE load_status AS ENUM (
  'publicada',
  'aplicada',
  'asignada',
  'en_camino',
  'entregada',
  'calificada',
  'cancelada'
);

CREATE TYPE application_status AS ENUM ('pendiente', 'aceptada', 'rechazada');

CREATE TYPE truck_type AS ENUM (
  'semirremolque',
  'volcador',
  'frigorifico',
  'chasis',
  'carrozado',
  'tanque',
  'portacontenedor',
  'batea'
);

CREATE TYPE cargo_type AS ENUM (
  'cereales',
  'alimentos',
  'maquinaria',
  'materiales_construccion',
  'productos_quimicos',
  'vehiculos',
  'ganado',
  'general',
  'refrigerados',
  'peligrosos'
);

CREATE TYPE plan_type AS ENUM (
  'basico',
  'profesional',
  'flota',
  'starter',
  'estandar',
  'premium',
  'enterprise'
);

CREATE TYPE notification_type AS ENUM (
  'nueva_carga',
  'aplicacion_recibida',
  'aplicacion_aceptada',
  'aplicacion_rechazada',
  'estado_carga',
  'nueva_calificacion',
  'sistema'
);

CREATE TYPE subscription_status AS ENUM ('activa', 'cancelada', 'vencida', 'pendiente');
