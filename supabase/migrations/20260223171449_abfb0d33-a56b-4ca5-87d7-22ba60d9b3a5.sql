
-- Transfers table
CREATE TABLE public.transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route jsonb NOT NULL DEFAULT '{"en": "", "ru": ""}',
  car_type jsonb NOT NULL DEFAULT '{"en": "", "ru": ""}',
  description jsonb NOT NULL DEFAULT '{"en": "", "ru": ""}',
  price integer NOT NULL DEFAULT 0,
  image text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active transfers"
  ON public.transfers FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage transfers"
  ON public.transfers FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Train Tickets table
CREATE TABLE public.train_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route jsonb NOT NULL DEFAULT '{"en": "", "ru": ""}',
  train_type jsonb NOT NULL DEFAULT '{"en": "", "ru": ""}',
  duration integer NOT NULL DEFAULT 0,
  price_from integer NOT NULL DEFAULT 0,
  description jsonb NOT NULL DEFAULT '{"en": "", "ru": ""}',
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.train_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active train tickets"
  ON public.train_tickets FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage train tickets"
  ON public.train_tickets FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Transfer bookings table
CREATE TABLE public.transfer_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid REFERENCES public.transfers(id) NOT NULL,
  user_id uuid NOT NULL,
  pickup_date date NOT NULL,
  pickup_time text NOT NULL,
  passengers integer NOT NULL DEFAULT 1,
  pickup_address text,
  dropoff_address text,
  phone text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.transfer_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own transfer bookings"
  ON public.transfer_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own transfer bookings"
  ON public.transfer_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all transfer bookings"
  ON public.transfer_bookings FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transfer bookings"
  ON public.transfer_bookings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Train ticket requests table
CREATE TABLE public.train_ticket_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  train_ticket_id uuid REFERENCES public.train_tickets(id) NOT NULL,
  user_id uuid,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  travel_date date NOT NULL,
  passengers integer NOT NULL DEFAULT 1,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.train_ticket_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create train ticket requests"
  ON public.train_ticket_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own requests"
  ON public.train_ticket_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all requests"
  ON public.train_ticket_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests"
  ON public.train_ticket_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));
