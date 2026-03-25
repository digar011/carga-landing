-- Migration: Create admin_logs table
-- Description: Audit log for admin actions with entity tracking

CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs (admin_id);
CREATE INDEX idx_admin_logs_entity ON admin_logs (entity);
CREATE INDEX idx_admin_logs_created_at ON admin_logs (created_at DESC);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin logs
CREATE POLICY "admin_logs_select_admin"
  ON admin_logs
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can insert admin logs
CREATE POLICY "admin_logs_insert_admin"
  ON admin_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
