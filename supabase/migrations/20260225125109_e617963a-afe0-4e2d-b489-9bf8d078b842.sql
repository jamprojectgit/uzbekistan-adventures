
-- Create storage bucket for tour images
INSERT INTO storage.buckets (id, name, public) VALUES ('tour-images', 'tour-images', true);

-- Public can view images
CREATE POLICY "Public can view tour images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tour-images');

-- Admins can upload tour images
CREATE POLICY "Admins can upload tour images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tour-images' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update tour images
CREATE POLICY "Admins can update tour images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'tour-images' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete tour images
CREATE POLICY "Admins can delete tour images"
ON storage.objects FOR DELETE
USING (bucket_id = 'tour-images' AND public.has_role(auth.uid(), 'admin'));
