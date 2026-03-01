
-- Drop dependent table first
DROP TABLE IF EXISTS public.transfer_bookings;

-- Drop existing transfers table
DROP TABLE IF EXISTS public.transfers;

-- Create new transfers table
CREATE TABLE public.transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_city text NOT NULL,
  to_city text NOT NULL,
  vehicle_type text NOT NULL,
  max_passengers integer NOT NULL DEFAULT 1,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  description text,
  image_url text,
  status text NOT NULL DEFAULT 'published',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- Public can read published transfers
CREATE POLICY "Public can read published transfers"
ON public.transfers FOR SELECT TO anon, authenticated
USING (status = 'published');

-- Authenticated users full access
CREATE POLICY "Authenticated users can insert transfers"
ON public.transfers FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update transfers"
ON public.transfers FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete transfers"
ON public.transfers FOR DELETE TO authenticated
USING (true);

-- Authenticated users need to read all (including non-published) for admin
CREATE POLICY "Authenticated users can read all transfers"
ON public.transfers FOR SELECT TO authenticated
USING (true);
