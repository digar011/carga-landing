-- Migration: Create subscriptions table
-- Description: Subscription/plan management with MercadoPago integration support

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  plan plan_type NOT NULL,
  estado subscription_status NOT NULL DEFAULT 'pendiente',
  mp_subscription_id TEXT,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX idx_subscriptions_estado ON subscriptions (estado);
CREATE INDEX idx_subscriptions_mp_subscription_id ON subscriptions (mp_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "subscriptions_select_own"
  ON subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all subscriptions
CREATE POLICY "subscriptions_select_admin"
  ON subscriptions
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update any subscription
CREATE POLICY "subscriptions_update_admin"
  ON subscriptions
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can insert subscriptions
CREATE POLICY "subscriptions_insert_admin"
  ON subscriptions
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
