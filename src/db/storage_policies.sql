-- admin policy
CREATE POLICY "Admins can view all receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- users policy
CREATE POLICY "Users can upload their own receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);