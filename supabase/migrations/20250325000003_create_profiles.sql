-- Migration: Create profile tables for transportistas and cargadores
-- Description: Separate profile tables for each user role with domain-specific fields

-- ============================================================
-- Transportista profile
-- ============================================================
CREATE TABLE profiles_transportista (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  cuit TEXT UNIQUE CHECK (cuit ~ '^\d{2}-\d{8}-\d{1}$'),
  telefono TEXT NOT NULL,
  whatsapp TEXT,
  provincia TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_viajes INT NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  plan plan_type NOT NULL DEFAULT 'basico',
  habilitaciones TEXT[] DEFAULT '{}',
  whatsapp_notifications BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_transportista_user_id ON profiles_transportista (user_id);
CREATE INDEX idx_profiles_transportista_provincia ON profiles_transportista (provincia);
CREATE INDEX idx_profiles_transportista_verified ON profiles_transportista (verified);

ALTER TABLE profiles_transportista ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "transportista_select_own"
  ON profiles_transportista
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all transportista profiles
CREATE POLICY "transportista_select_admin"
  ON profiles_transportista
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Public (authenticated) can read limited fields for ratings display
CREATE POLICY "transportista_select_public"
  ON profiles_transportista
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can insert their own profile
CREATE POLICY "transportista_insert_own"
  ON profiles_transportista
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "transportista_update_own"
  ON profiles_transportista
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can update any profile
CREATE POLICY "transportista_update_admin"
  ON profiles_transportista
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER profiles_transportista_updated_at
  BEFORE UPDATE ON profiles_transportista
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Cargador profile
-- ============================================================
CREATE TABLE profiles_cargador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  empresa TEXT NOT NULL,
  cuit TEXT UNIQUE CHECK (cuit ~ '^\d{2}-\d{8}-\d{1}$'),
  contacto_nombre TEXT NOT NULL,
  contacto_telefono TEXT NOT NULL,
  contacto_email TEXT NOT NULL,
  provincia TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_cargas INT NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  plan plan_type NOT NULL DEFAULT 'starter',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_cargador_user_id ON profiles_cargador (user_id);
CREATE INDEX idx_profiles_cargador_provincia ON profiles_cargador (provincia);
CREATE INDEX idx_profiles_cargador_verified ON profiles_cargador (verified);

ALTER TABLE profiles_cargador ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "cargador_select_own"
  ON profiles_cargador
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all cargador profiles
CREATE POLICY "cargador_select_admin"
  ON profiles_cargador
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Public (authenticated) can read for ratings display
CREATE POLICY "cargador_select_public"
  ON profiles_cargador
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can insert their own profile
CREATE POLICY "cargador_insert_own"
  ON profiles_cargador
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "cargador_update_own"
  ON profiles_cargador
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can update any profile
CREATE POLICY "cargador_update_admin"
  ON profiles_cargador
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER profiles_cargador_updated_at
  BEFORE UPDATE ON profiles_cargador
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
