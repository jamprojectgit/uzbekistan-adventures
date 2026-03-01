
-- Create train_routes table
CREATE TABLE public.train_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  train_type text NOT NULL,
  from_city text NOT NULL,
  to_city text NOT NULL,
  departure_time text NOT NULL,
  arrival_time text NOT NULL,
  operating_days text NOT NULL DEFAULT 'Daily',
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'published',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.train_routes ENABLE ROW LEVEL SECURITY;

-- Public can read published routes
CREATE POLICY "Public can read published train routes"
ON public.train_routes
FOR SELECT
USING (status = 'published');

-- Admins can manage all routes
CREATE POLICY "Admins can manage train routes"
ON public.train_routes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
