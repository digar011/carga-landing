-- Migration: Create notifications table
-- Description: In-app notification system with read status and metadata support

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  tipo notification_type NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_leida ON notifications (leida);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, leida) WHERE leida = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
  ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- System/admin can insert notifications (via service role or triggers)
-- No INSERT policy for regular users — notifications are created server-side
CREATE POLICY "notifications_insert_admin"
  ON notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
