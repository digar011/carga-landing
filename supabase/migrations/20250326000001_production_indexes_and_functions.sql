-- Migration: Production optimizations
-- Description: Additional indexes, functions, and constraints for production deployment
-- Run after all base migrations (20250325000001-10)

-- ============================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================================

-- Composite index for load board filtering (most common query)
CREATE INDEX IF NOT EXISTS idx_loads_board_query
  ON loads (estado, created_at DESC)
  WHERE estado = 'publicada';

-- Composite index for loads by province + type (filter combo)
CREATE INDEX IF NOT EXISTS idx_loads_province_truck
  ON loads (origen_provincia, tipo_camion_requerido)
  WHERE estado = 'publicada';

-- Index for load search by city
CREATE INDEX IF NOT EXISTS idx_loads_origen_ciudad_trgm
  ON loads USING gin (origen_ciudad gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_loads_destino_ciudad_trgm
  ON loads USING gin (destino_ciudad gin_trgm_ops);

-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index for pending applications count (used in cargador dashboard)
CREATE INDEX IF NOT EXISTS idx_applications_pending
  ON load_applications (load_id)
  WHERE estado = 'pendiente';

-- Index for subscription lookups by status
CREATE INDEX IF NOT EXISTS idx_subscriptions_active
  ON subscriptions (user_id)
  WHERE estado = 'activa';

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function: Count user's active loads (for free tier enforcement)
CREATE OR REPLACE FUNCTION count_user_loads_this_month(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM loads l
  JOIN profiles_cargador pc ON pc.id = l.cargador_id
  WHERE pc.user_id = p_user_id
    AND l.created_at >= date_trunc('month', NOW());
  RETURN v_count;
END;
$$;

-- Function: Count user's searches today (for free tier enforcement)
-- Note: This would ideally be tracked in a separate table or Redis.
-- For MVP, we use a simple function that can be called from the API.
CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
RETURNS plan_type
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan plan_type;
BEGIN
  -- Check transportista profile first
  SELECT plan INTO v_plan
  FROM profiles_transportista
  WHERE user_id = p_user_id;

  IF v_plan IS NOT NULL THEN
    RETURN v_plan;
  END IF;

  -- Check cargador profile
  SELECT plan INTO v_plan
  FROM profiles_cargador
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_plan, 'basico');
END;
$$;

-- Function: Check if user's CUIT is verified
CREATE OR REPLACE FUNCTION is_user_verified(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_verified BOOLEAN;
BEGIN
  SELECT verified INTO v_verified
  FROM profiles_transportista
  WHERE user_id = p_user_id;

  IF v_verified IS NOT NULL THEN
    RETURN v_verified;
  END IF;

  SELECT verified INTO v_verified
  FROM profiles_cargador
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_verified, false);
END;
$$;

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================

-- Enable realtime on loads table (for live load board updates)
ALTER PUBLICATION supabase_realtime ADD TABLE loads;

-- Enable realtime on notifications (for in-app notification bell)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable realtime on load_applications (for cargador to see new applications)
ALTER PUBLICATION supabase_realtime ADD TABLE load_applications;

-- ============================================================
-- DATA INTEGRITY CONSTRAINTS
-- ============================================================

-- Ensure transportista can't apply to their own load
-- (enforced at API level too, but belt-and-suspenders)
CREATE OR REPLACE FUNCTION check_no_self_application()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM loads l
    JOIN profiles_cargador pc ON pc.id = l.cargador_id
    JOIN profiles_transportista pt ON pt.id = NEW.transportista_id
    WHERE l.id = NEW.load_id
      AND pc.user_id = pt.user_id
  ) THEN
    RAISE EXCEPTION 'No podés aplicar a tu propia carga';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_self_application
  BEFORE INSERT ON load_applications
  FOR EACH ROW
  EXECUTE FUNCTION check_no_self_application();

-- Ensure rating score stays between 1 and 5
-- (already has CHECK constraint, but add trigger for extra safety)
CREATE OR REPLACE FUNCTION check_rating_eligibility()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verify the load is in 'entregada' or 'calificada' status
  IF NOT EXISTS (
    SELECT 1 FROM loads
    WHERE id = NEW.load_id
      AND estado IN ('entregada', 'calificada')
  ) THEN
    RAISE EXCEPTION 'Solo podés calificar cargas con estado "entregada"';
  END IF;

  -- Prevent self-rating
  IF NEW.from_user_id = NEW.to_user_id THEN
    RAISE EXCEPTION 'No podés calificarte a vos mismo';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_rating_before_insert
  BEFORE INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION check_rating_eligibility();
