ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS pricing_type text NOT NULL DEFAULT 'per_person';

CREATE OR REPLACE FUNCTION public.validate_pricing_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.pricing_type NOT IN ('per_person', 'per_group') THEN
    RAISE EXCEPTION 'pricing_type must be per_person or per_group';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_pricing_type ON public.tours;
CREATE TRIGGER check_pricing_type BEFORE INSERT OR UPDATE ON public.tours
FOR EACH ROW EXECUTE FUNCTION public.validate_pricing_type();

CREATE TABLE IF NOT EXISTS public.tour_price_tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  min_people integer NOT NULL,
  max_people integer NOT NULL,
  price integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tour_price_tiers_range_valid CHECK (min_people >= 1 AND max_people >= min_people),
  CONSTRAINT tour_price_tiers_price_nonneg CHECK (price >= 0)
);

CREATE INDEX IF NOT EXISTS tour_price_tiers_tour_id_idx ON public.tour_price_tiers(tour_id);

GRANT SELECT ON public.tour_price_tiers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tour_price_tiers TO authenticated;
GRANT ALL ON public.tour_price_tiers TO service_role;

ALTER TABLE public.tour_price_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read tour price tiers"
ON public.tour_price_tiers FOR SELECT USING (true);

CREATE POLICY "Admins can manage tour price tiers"
ON public.tour_price_tiers FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.validate_tour_price_tier()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tour_price_tiers t
    WHERE t.tour_id = NEW.tour_id
      AND t.id <> NEW.id
      AND NEW.min_people <= t.max_people
      AND NEW.max_people >= t.min_people
  ) THEN
    RAISE EXCEPTION 'Pricing ranges must not overlap';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_tour_price_tier ON public.tour_price_tiers;
CREATE TRIGGER check_tour_price_tier BEFORE INSERT OR UPDATE ON public.tour_price_tiers
FOR EACH ROW EXECUTE FUNCTION public.validate_tour_price_tier();

REVOKE ALL ON FUNCTION public.validate_pricing_type() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_tour_price_tier() FROM PUBLIC, anon;