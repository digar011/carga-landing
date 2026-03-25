-- ============================================
-- CarGA — Seed Data for Development
-- ============================================
-- Realistic Argentine freight data for testing.
-- Run: supabase db seed
-- ============================================

-- Note: In a real environment, users are created via Supabase Auth.
-- This seed data assumes auth.users entries already exist.
-- For local development, create test users via the Supabase Studio UI first,
-- then this seed populates the application tables.

-- Sample transportista profiles (assumes user_ids exist in auth.users)
-- In development, use Supabase Studio to create these users first.

-- Example seed data structure (uncomment and adapt after auth users are created):

/*
-- Transportista profiles
INSERT INTO profiles_transportista (user_id, nombre, apellido, cuit, telefono, whatsapp, provincia, ciudad, rating, total_viajes, verified, plan, habilitaciones, whatsapp_notifications)
VALUES
  ('uuid-transportista-1', 'Juan', 'García', '20-28473691-4', '+5491112345678', '+5491112345678', 'Buenos Aires', 'CABA', 4.8, 47, true, 'profesional', ARRAY['carga_general', 'cereales'], true),
  ('uuid-transportista-2', 'Carlos', 'Fernández', '20-31456789-2', '+5491123456789', '+5491123456789', 'Córdoba', 'Córdoba Capital', 4.5, 32, true, 'basico', ARRAY['carga_general'], true),
  ('uuid-transportista-3', 'Miguel', 'Rodríguez', '20-29876543-1', '+5491134567890', '+5491134567890', 'Santa Fe', 'Rosario', 4.9, 89, true, 'flota', ARRAY['carga_general', 'refrigerados', 'peligrosos'], true),
  ('uuid-transportista-4', 'Roberto', 'Martínez', '20-33567891-5', '+5491145678901', NULL, 'Buenos Aires', 'La Plata', 4.2, 15, true, 'basico', ARRAY['carga_general'], false),
  ('uuid-transportista-5', 'Diego', 'López', '20-27654321-8', '+5491156789012', '+5491156789012', 'Mendoza', 'Mendoza Capital', 4.7, 63, true, 'profesional', ARRAY['carga_general', 'vehiculos'], true);

-- Cargador profiles
INSERT INTO profiles_cargador (user_id, empresa, cuit, contacto_nombre, contacto_telefono, contacto_email, provincia, ciudad, rating, total_cargas, verified, plan)
VALUES
  ('uuid-cargador-1', 'Agro San Martín S.A.', '30-71234567-9', 'Martín Aguilar', '+5491167890123', 'martin@agrosanmartin.com.ar', 'Buenos Aires', 'Pergamino', 4.8, 23, true, 'premium'),
  ('uuid-cargador-2', 'Construcciones del Sur SRL', '30-72345678-1', 'Laura Pérez', '+5491178901234', 'laura@construccionesdelsur.com.ar', 'Buenos Aires', 'CABA', 4.6, 18, true, 'estandar'),
  ('uuid-cargador-3', 'Frigorífico Pampeano S.A.', '30-73456789-3', 'Ricardo Gómez', '+5491189012345', 'ricardo@frigopampeano.com.ar', 'Córdoba', 'Villa María', 4.9, 45, true, 'premium'),
  ('uuid-cargador-4', 'Industrias Metalúrgicas Norte', '30-74567890-5', 'Andrés Silva', '+5491190123456', 'andres@imnorte.com.ar', 'Tucumán', 'San Miguel de Tucumán', 4.3, 12, true, 'starter');

-- Trucks
INSERT INTO trucks (transportista_id, tipo, patente, capacidad_tn, marca, modelo, anio, activo)
VALUES
  ((SELECT id FROM profiles_transportista WHERE cuit = '20-28473691-4'), 'semirremolque', 'AB123CD', 28, 'Mercedes Benz', 'Axor 2544', 2019, true),
  ((SELECT id FROM profiles_transportista WHERE cuit = '20-31456789-2'), 'volcador', 'AC456EF', 22, 'Scania', 'P310', 2020, true),
  ((SELECT id FROM profiles_transportista WHERE cuit = '20-29876543-1'), 'frigorifico', 'AD789GH', 25, 'Volvo', 'FH 460', 2021, true),
  ((SELECT id FROM profiles_transportista WHERE cuit = '20-29876543-1'), 'semirremolque', 'AE012IJ', 30, 'Mercedes Benz', 'Actros 2646', 2022, true),
  ((SELECT id FROM profiles_transportista WHERE cuit = '20-33567891-5'), 'carrozado', 'AF345KL', 18, 'Ford', 'Cargo 1722', 2018, true),
  ((SELECT id FROM profiles_transportista WHERE cuit = '20-27654321-8'), 'portacontenedor', 'AG678MN', 32, 'Scania', 'R450', 2020, true);

-- Sample loads
INSERT INTO loads (cargador_id, origen_lat, origen_lng, origen_ciudad, origen_provincia, destino_lat, destino_lng, destino_ciudad, destino_provincia, distancia_km, tipo_carga, descripcion_carga, peso_tn, tipo_camion_requerido, tarifa_ars, tarifa_negociable, fecha_carga, observaciones, estado)
VALUES
  ((SELECT id FROM profiles_cargador WHERE cuit = '30-71234567-9'), -34.6037, -58.3816, 'CABA', 'Buenos Aires', -31.4201, -64.1888, 'Córdoba Capital', 'Córdoba', 710, 'cereales', 'Soja a granel para exportación', 25, 'semirremolque', 285000, true, NOW() + interval '2 days', 'Requiere lona. Planta con balanza.', 'publicada'),
  ((SELECT id FROM profiles_cargador WHERE cuit = '30-72345678-1'), -32.9468, -60.6393, 'Rosario', 'Santa Fe', -32.8895, -68.8458, 'Mendoza Capital', 'Mendoza', 940, 'maquinaria', 'Equipo industrial embalado', 18, 'volcador', 340000, false, NOW() + interval '3 days', 'Carga frágil. Requiere experiencia.', 'publicada'),
  ((SELECT id FROM profiles_cargador WHERE cuit = '30-73456789-3'), -31.4201, -64.1888, 'Córdoba Capital', 'Córdoba', -26.8083, -65.2176, 'San Miguel de Tucumán', 'Tucumán', 520, 'alimentos', 'Productos lácteos refrigerados', 30, 'frigorifico', 220000, true, NOW() + interval '1 day', 'Mantener cadena de frío. Temperatura: -2°C a 4°C.', 'publicada'),
  ((SELECT id FROM profiles_cargador WHERE cuit = '30-71234567-9'), -34.6037, -58.3816, 'CABA', 'Buenos Aires', -38.0055, -57.5426, 'Mar del Plata', 'Buenos Aires', 380, 'materiales_construccion', 'Hierro y perfiles estructurales', 12, 'volcador', 145000, false, NOW() + interval '4 days', NULL, 'publicada'),
  ((SELECT id FROM profiles_cargador WHERE cuit = '30-73456789-3'), -31.6107, -60.6973, 'Santa Fe', 'Santa Fe', -31.4201, -64.1888, 'Córdoba Capital', 'Córdoba', 350, 'cereales', 'Trigo a granel', 28, 'semirremolque', 175000, true, NOW() + interval '2 days', 'Carga en silo. Documentación SENASA requerida.', 'publicada'),
  ((SELECT id FROM profiles_cargador WHERE cuit = '30-72345678-1'), -32.8895, -68.8458, 'Mendoza Capital', 'Mendoza', -34.6037, -58.3816, 'CABA', 'Buenos Aires', 1050, 'alimentos', 'Vinos embotellados - pallets', 8, 'carrozado', 390000, false, NOW() + interval '5 days', 'Carga delicada. No apilar más de 3 pallets.', 'publicada'),
  ((SELECT id FROM profiles_cargador WHERE cuit = '30-74567890-5'), -26.8083, -65.2176, 'San Miguel de Tucumán', 'Tucumán', -34.6037, -58.3816, 'CABA', 'Buenos Aires', 1300, 'general', 'Muebles y electrodomésticos embalados', 15, 'carrozado', 450000, true, NOW() + interval '3 days', 'Requiere cuidado en descarga.', 'publicada'),
  ((SELECT id FROM profiles_cargador WHERE cuit = '30-71234567-9'), -34.6037, -58.3816, 'CABA', 'Buenos Aires', -32.9468, -60.6393, 'Rosario', 'Santa Fe', 300, 'productos_quimicos', 'Productos de limpieza industrial - peligrosos', 20, 'tanque', 280000, false, NOW() + interval '1 day', 'Requiere habilitación para mercancías peligrosas.', 'publicada');
*/

-- Placeholder message for development
-- Create test users via Supabase Auth first, then uncomment above queries
-- and replace UUID placeholders with actual user IDs.
SELECT 'Seed file loaded. Create auth users first, then uncomment INSERT statements.' AS message;
