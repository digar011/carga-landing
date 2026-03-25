import { z } from 'zod';

// CUIT format: XX-XXXXXXXX-X (11 digits)
export const cuitSchema = z
  .string()
  .regex(/^\d{2}-\d{8}-\d{1}$/, 'Formato: XX-XXXXXXXX-X');

// Patente (license plate) format: ABC123 or AB123CD
export const patenteSchema = z
  .string()
  .regex(/^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/, 'Formato: ABC123 o AB123CD');

export const loginSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});

export const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(['transportista', 'cargador']),
});

export const loadSchema = z.object({
  origen_ciudad: z.string().min(2, 'Ingresá la ciudad de origen'),
  origen_provincia: z.string().min(2, 'Seleccioná la provincia de origen'),
  destino_ciudad: z.string().min(2, 'Ingresá la ciudad de destino'),
  destino_provincia: z.string().min(2, 'Seleccioná la provincia de destino'),
  tipo_carga: z.enum([
    'cereales', 'alimentos', 'maquinaria', 'materiales_construccion',
    'productos_quimicos', 'vehiculos', 'ganado', 'general',
    'refrigerados', 'peligrosos',
  ]),
  descripcion_carga: z.string().min(3, 'Describí la carga'),
  peso_tn: z.number().positive('El peso debe ser mayor a 0'),
  tipo_camion_requerido: z.enum([
    'semirremolque', 'volcador', 'frigorifico', 'chasis',
    'carrozado', 'tanque', 'portacontenedor', 'batea',
  ]),
  tarifa_ars: z.number().positive('La tarifa debe ser mayor a 0'),
  tarifa_negociable: z.boolean(),
  fecha_carga: z.string().min(1, 'Seleccioná la fecha de carga'),
  fecha_entrega: z.string().optional(),
  observaciones: z.string().optional(),
});

export const profileTransportistaSchema = z.object({
  nombre: z.string().min(2, 'Ingresá tu nombre'),
  apellido: z.string().min(2, 'Ingresá tu apellido'),
  cuit: cuitSchema,
  telefono: z.string().min(8, 'Ingresá un teléfono válido'),
  whatsapp: z.string().optional(),
  provincia: z.string().min(2, 'Seleccioná tu provincia'),
  ciudad: z.string().min(2, 'Ingresá tu ciudad'),
});

export const profileCargadorSchema = z.object({
  empresa: z.string().min(2, 'Ingresá el nombre de la empresa'),
  cuit: cuitSchema,
  contacto_nombre: z.string().min(2, 'Ingresá el nombre de contacto'),
  contacto_telefono: z.string().min(8, 'Ingresá un teléfono válido'),
  contacto_email: z.string().email('Ingresá un email válido'),
  provincia: z.string().min(2, 'Seleccioná la provincia'),
  ciudad: z.string().min(2, 'Ingresá la ciudad'),
});

export const truckSchema = z.object({
  tipo: z.enum([
    'semirremolque', 'volcador', 'frigorifico', 'chasis',
    'carrozado', 'tanque', 'portacontenedor', 'batea',
  ]),
  patente: patenteSchema,
  capacidad_tn: z.number().positive('La capacidad debe ser mayor a 0'),
  marca: z.string().min(2, 'Ingresá la marca'),
  modelo: z.string().min(1, 'Ingresá el modelo'),
  anio: z.number().int().min(1990).max(new Date().getFullYear() + 1),
});

export const ratingSchema = z.object({
  score: z.number().int().min(1).max(5),
  comentario: z.string().max(500).optional(),
});

export const applicationSchema = z.object({
  mensaje: z.string().max(500).optional(),
});
