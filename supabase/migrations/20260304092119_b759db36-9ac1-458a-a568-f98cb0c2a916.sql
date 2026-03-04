
CREATE TABLE public.tour_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id TEXT NOT NULL,
  tour_title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  travelers INTEGER NOT NULL DEFAULT 1,
  pickup_location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tour_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert tour requests"
  ON public.tour_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read tour requests"
  ON public.tour_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
