-- Enable Realtime publication on the three tables
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE ingredients;
ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_settings;

-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('menu-images', 'menu-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('ingredient-pngs', 'ingredient-pngs', false, 2097152, ARRAY['image/png']),
  ('feedback-photos', 'feedback-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies for feedback-photos
CREATE POLICY "feedback_photos_user_upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'feedback-photos' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = 'feedback'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "feedback_photos_user_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'feedback-photos'
  AND (
    (storage.foldername(name))[1] = 'feedback' AND (storage.foldername(name))[2] = auth.uid()::text
    OR EXISTS (SELECT 1 FROM public.staff_accounts WHERE user_id = auth.uid() AND is_active = true)
  )
);
