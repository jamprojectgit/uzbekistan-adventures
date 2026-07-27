-- 1. Fix search_path on validate_duration_unit
CREATE OR REPLACE FUNCTION public.validate_duration_unit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.duration_unit NOT IN ('hours', 'days') THEN
    RAISE EXCEPTION 'duration_unit must be hours or days';
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Revoke direct API execution of internal functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_duration_unit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_duration_unit() TO service_role;

-- 3. Transfers: restrict writes to admins only
DROP POLICY IF EXISTS "Authenticated users can delete transfers" ON public.transfers;
DROP POLICY IF EXISTS "Authenticated users can insert transfers" ON public.transfers;
DROP POLICY IF EXISTS "Authenticated users can update transfers" ON public.transfers;
DROP POLICY IF EXISTS "Authenticated users can read all transfers" ON public.transfers;

CREATE POLICY "Admins can manage transfers"
ON public.transfers FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. tour_requests: validated public insert instead of blanket true
DROP POLICY IF EXISTS "Anyone can insert tour requests" ON public.tour_requests;
CREATE POLICY "Anyone can submit valid tour requests"
ON public.tour_requests FOR INSERT TO anon, authenticated
WITH CHECK (
  length(tour_id) BETWEEN 1 AND 200
  AND length(tour_title) BETWEEN 1 AND 300
  AND length(time) BETWEEN 1 AND 50
  AND length(pickup_location) BETWEEN 1 AND 500
  AND travelers BETWEEN 1 AND 100
);

-- 5. train_ticket_requests: validated public insert
DROP POLICY IF EXISTS "Anyone can create train ticket requests" ON public.train_ticket_requests;
CREATE POLICY "Anyone can submit valid train ticket requests"
ON public.train_ticket_requests FOR INSERT TO anon, authenticated
WITH CHECK (
  length(full_name) BETWEEN 1 AND 200
  AND length(phone) BETWEEN 3 AND 50
  AND (email IS NULL OR length(email) <= 200)
  AND (notes IS NULL OR length(notes) <= 2000)
  AND passengers BETWEEN 1 AND 100
  AND status = 'pending'
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- 6. Storage: keep public file access via direct URLs, block bucket listing
DROP POLICY IF EXISTS "Public can view tour images" ON storage.objects;
CREATE POLICY "Admins can view tour images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'tour-images' AND public.has_role(auth.uid(), 'admin'));
