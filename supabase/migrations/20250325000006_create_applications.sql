-- Migration: Create load_applications table
-- Description: Tracks transportista applications to available loads

CREATE TABLE load_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID NOT NULL REFERENCES loads (id) ON DELETE CASCADE,
  transportista_id UUID NOT NULL REFERENCES profiles_transportista (id) ON DELETE CASCADE,
  mensaje TEXT,
  estado application_status NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One application per load per carrier
ALTER TABLE load_applications
  ADD CONSTRAINT uq_load_applications_load_transportista
  UNIQUE (load_id, transportista_id);

CREATE INDEX idx_load_applications_load_id ON load_applications (load_id);
CREATE INDEX idx_load_applications_transportista_id ON load_applications (transportista_id);

ALTER TABLE load_applications ENABLE ROW LEVEL SECURITY;

-- Transportista can read their own applications
CREATE POLICY "applications_select_own_transportista"
  ON load_applications
  FOR SELECT
  USING (
    transportista_id IN (
      SELECT id FROM profiles_transportista WHERE user_id = auth.uid()
    )
  );

-- Transportista can create applications
CREATE POLICY "applications_insert_transportista"
  ON load_applications
  FOR INSERT
  WITH CHECK (
    transportista_id IN (
      SELECT id FROM profiles_transportista WHERE user_id = auth.uid()
    )
  );

-- Cargador (load owner) can read applications for their loads
CREATE POLICY "applications_select_load_owner"
  ON load_applications
  FOR SELECT
  USING (
    load_id IN (
      SELECT l.id FROM loads l
      JOIN profiles_cargador pc ON pc.id = l.cargador_id
      WHERE pc.user_id = auth.uid()
    )
  );

-- Cargador (load owner) can update applications for their loads (accept/reject)
CREATE POLICY "applications_update_load_owner"
  ON load_applications
  FOR UPDATE
  USING (
    load_id IN (
      SELECT l.id FROM loads l
      JOIN profiles_cargador pc ON pc.id = l.cargador_id
      WHERE pc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    load_id IN (
      SELECT l.id FROM loads l
      JOIN profiles_cargador pc ON pc.id = l.cargador_id
      WHERE pc.user_id = auth.uid()
    )
  );

-- Admin can read all applications
CREATE POLICY "applications_select_admin"
  ON load_applications
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin can update any application
CREATE POLICY "applications_update_admin"
  ON load_applications
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER load_applications_updated_at
  BEFORE UPDATE ON load_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
