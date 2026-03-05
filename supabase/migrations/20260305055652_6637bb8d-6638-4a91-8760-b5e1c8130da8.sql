
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS duration_value integer;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS duration_unit text DEFAULT 'days';

-- Migrate existing data
UPDATE public.tours SET duration_value = duration, duration_unit = 'days' WHERE duration_value IS NULL;

-- Set NOT NULL after migration
ALTER TABLE public.tours ALTER COLUMN duration_value SET DEFAULT 1;
ALTER TABLE public.tours ALTER COLUMN duration_value SET NOT NULL;
ALTER TABLE public.tours ALTER COLUMN duration_unit SET NOT NULL;

-- Add validation trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_duration_unit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.duration_unit NOT IN ('hours', 'days') THEN
    RAISE EXCEPTION 'duration_unit must be hours or days';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_duration_unit
BEFORE INSERT OR UPDATE ON public.tours
FOR EACH ROW EXECUTE FUNCTION public.validate_duration_unit();
