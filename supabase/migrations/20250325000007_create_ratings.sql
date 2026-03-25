-- Migration: Create ratings table with auto-update triggers
-- Description: User-to-user ratings tied to completed loads, with avg rating sync to profiles

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  load_id UUID NOT NULL REFERENCES loads (id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One rating per user per load
ALTER TABLE ratings
  ADD CONSTRAINT uq_ratings_from_user_load
  UNIQUE (from_user_id, load_id);

CREATE INDEX idx_ratings_from_user_id ON ratings (from_user_id);
CREATE INDEX idx_ratings_to_user_id ON ratings (to_user_id);
CREATE INDEX idx_ratings_load_id ON ratings (load_id);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Authenticated users can create ratings (for their own from_user_id)
CREATE POLICY "ratings_insert_own"
  ON ratings
  FOR INSERT
  WITH CHECK (from_user_id = auth.uid());

-- Authenticated users can read all ratings
CREATE POLICY "ratings_select_authenticated"
  ON ratings
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Trigger function: update average rating on transportista profile
CREATE OR REPLACE FUNCTION update_transportista_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avg NUMERIC(3,2);
  v_count INT;
BEGIN
  SELECT AVG(r.score)::NUMERIC(3,2), COUNT(r.id)
  INTO v_avg, v_count
  FROM ratings r
  JOIN profiles_transportista pt ON pt.user_id = r.to_user_id
  WHERE r.to_user_id = NEW.to_user_id;

  UPDATE profiles_transportista
  SET rating = COALESCE(v_avg, 0),
      total_viajes = v_count
  WHERE user_id = NEW.to_user_id;

  RETURN NEW;
END;
$$;

-- Trigger function: update average rating on cargador profile
CREATE OR REPLACE FUNCTION update_cargador_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avg NUMERIC(3,2);
  v_count INT;
BEGIN
  SELECT AVG(r.score)::NUMERIC(3,2), COUNT(r.id)
  INTO v_avg, v_count
  FROM ratings r
  JOIN profiles_cargador pc ON pc.user_id = r.to_user_id
  WHERE r.to_user_id = NEW.to_user_id;

  UPDATE profiles_cargador
  SET rating = COALESCE(v_avg, 0),
      total_cargas = v_count
  WHERE user_id = NEW.to_user_id;

  RETURN NEW;
END;
$$;

-- Fire both triggers — only one will actually update (the one that matches the user's role)
CREATE TRIGGER ratings_update_transportista_avg
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_transportista_rating();

CREATE TRIGGER ratings_update_cargador_avg
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_cargador_rating();
