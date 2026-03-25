-- Migration: Create loads table
-- Description: Core table for freight load postings with location, cargo, and status tracking

CREATE TABLE loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cargador_id UUID NOT NULL REFERENCES profiles_cargador (id) ON DELETE CASCADE,
  origen_lat DOUBLE PRECISION NOT NULL,
  origen_lng DOUBLE PRECISION NOT NULL,
  origen_ciudad TEXT NOT NULL,
  origen_provincia TEXT NOT NULL,
  destino_lat DOUBLE PRECISION NOT NULL,
  destino_lng DOUBLE PRECISION NOT NULL,
  destino_ciudad TEXT NOT NULL,
  destino_provincia TEXT NOT NULL,
  distancia_km NUMERIC,
  tipo_carga cargo_type NOT NULL,
  descripcion_carga TEXT NOT NULL,
  peso_tn NUMERIC NOT NULL CHECK (peso_tn > 0),
  tipo_camion_requerido truck_type NOT NULL,
  tarifa_ars NUMERIC NOT NULL CHECK (tarifa_ars > 0),
  tarifa_negociable BOOLEAN NOT NULL DEFAULT false,
  fecha_carga TIMESTAMPTZ NOT NULL,
  fecha_entrega TIMESTAMPTZ,
  observaciones TEXT,
  estado load_status NOT NULL DEFAULT 'publicada',
  transportista_asignado_id UUID REFERENCES profiles_transportista (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_loads_cargador_id ON loads (cargador_id);
CREATE INDEX idx_loads_estado ON loads (estado);
CREATE INDEX idx_loads_tipo_camion_requerido ON loads (tipo_camion_requerido);
CREATE INDEX idx_loads_origen_provincia ON loads (origen_provincia);
CREATE INDEX idx_loads_destino_provincia ON loads (destino_provincia);
CREATE INDEX idx_loads_created_at ON loads (created_at DESC);
CREATE INDEX idx_loads_transportista_asignado ON loads (transportista_asignado_id);

ALTER TABLE loads ENABLE ROW LEVEL SECURITY;

-- Published loads visible to all authenticated users
CREATE POLICY "loads_select_published"
  ON loads
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND estado = 'publicada'
  );

-- Cargador can read all their own loads (any status)
CREATE POLICY "loads_select_own_cargador"
  ON loads
  FOR SELECT
  USING (
    cargador_id IN (
      SELECT id FROM profiles_cargador WHERE user_id = auth.uid()
    )
  );

-- Assigned transportista can read their assigned loads
CREATE POLICY "loads_select_assigned_transportista"
  ON loads
  FOR SELECT
  USING (
    transportista_asignado_id IN (
      SELECT id FROM profiles_transportista WHERE user_id = auth.uid()
    )
  );

-- Cargador can insert loads
CREATE POLICY "loads_insert_cargador"
  ON loads
  FOR INSERT
  WITH CHECK (
    cargador_id IN (
      SELECT id FROM profiles_cargador WHERE user_id = auth.uid()
    )
  );

-- Cargador can update their own loads
CREATE POLICY "loads_update_own_cargador"
  ON loads
  FOR UPDATE
  USING (
    cargador_id IN (
      SELECT id FROM profiles_cargador WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    cargador_id IN (
      SELECT id FROM profiles_cargador WHERE user_id = auth.uid()
    )
  );

-- Cargador can delete their own loads
CREATE POLICY "loads_delete_own_cargador"
  ON loads
  FOR DELETE
  USING (
    cargador_id IN (
      SELECT id FROM profiles_cargador WHERE user_id = auth.uid()
    )
  );

-- Admin can read all loads
CREATE POLICY "loads_select_admin"
  ON loads
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin can update any load
CREATE POLICY "loads_update_admin"
  ON loads
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin can delete any load
CREATE POLICY "loads_delete_admin"
  ON loads
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER loads_updated_at
  BEFORE UPDATE ON loads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
