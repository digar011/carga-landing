-- Migration: Create users table extending Supabase auth
-- Description: Links auth.users to app-level user data with role assignment

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'transportista',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on role for admin queries
CREATE INDEX idx_users_role ON users (role);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: users can read their own row
CREATE POLICY "users_select_own"
  ON users
  FOR SELECT
  USING (id = auth.uid());

-- Policy: admins can read all users
CREATE POLICY "users_select_admin"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Policy: users can update their own row
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy: admins can update any user
CREATE POLICY "users_update_admin"
  ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Trigger function: auto-create user row on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::user_role,
      'transportista'
    )
  );
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger function: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
