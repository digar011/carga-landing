-- Migration: Create trucks table
-- Description: Stores truck/vehicle information linked to transportista profiles

CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transportista_id UUID NOT NULL REFERENCES profiles_transportista (id) ON DELETE CASCADE,
  tipo truck_type NOT NULL,
  patente TEXT NOT NULL UNIQUE CHECK (patente ~ '^[A-Z]{2}\d{3}[A-Z]{2}$' OR patente ~ '^[A-Z]{3}\d{3}$'),
  capacidad_tn NUMERIC NOT NULL CHECK (capacidad_tn > 0),
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  anio INT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trucks_transportista_id ON trucks (transportista_id);
CREATE INDEX idx_trucks_tipo ON trucks (tipo);
CREATE INDEX idx_trucks_activo ON trucks (activo);

ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;

-- Transportista can read their own trucks
CREATE POLICY "trucks_select_own"
  ON trucks
  FOR SELECT
  USING (
    transportista_id IN (
      SELECT id FROM profiles_transportista WHERE user_id = auth.uid()
    )
  );

-- Transportista can insert their own trucks
CREATE POLICY "trucks_insert_own"
  ON trucks
  FOR INSERT
  WITH CHECK (
    transportista_id IN (
      SELECT id FROM profiles_transportista WHERE user_id = auth.uid()
    )
  );

-- Transportista can update their own trucks
CREATE POLICY "trucks_update_own"
  ON trucks
  FOR UPDATE
  USING (
    transportista_id IN (
      SELECT id FROM profiles_transportista WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    transportista_id IN (
      SELECT id FROM profiles_transportista WHERE user_id = auth.uid()
    )
  );

-- Transportista can delete their own trucks
CREATE POLICY "trucks_delete_own"
  ON trucks
  FOR DELETE
  USING (
    transportista_id IN (
      SELECT id FROM profiles_transportista WHERE user_id = auth.uid()
    )
  );

-- Admin can read all trucks
CREATE POLICY "trucks_select_admin"
  ON trucks
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Cargadores can read active trucks (to see carrier fleet)
CREATE POLICY "trucks_select_cargador"
  ON trucks
  FOR SELECT
  USING (
    activo = true
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'cargador')
  );
