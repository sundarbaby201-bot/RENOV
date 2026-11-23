/*
# Fix grants: revoke anon access, create product-images storage bucket

## Overview
1. Revoke anon role privileges on users, products, and offers tables.
   These tables require authenticated users only. The anon role should
   not have any access (no public/unauthenticated reads or writes).
2. Create a 'product-images' storage bucket for the four mandatory
   product photos.
3. Add storage policies so only authenticated users can upload/read/delete
   images, and a seller can only manage images in their own folder.

## Security Changes
- REVOKE all privileges from anon on users, products, offers.
- Storage bucket 'product-images' is private (not public).
- SELECT (read) on storage objects: authenticated users can read product images
  (needed so buyers can view photos).
- INSERT (upload) on storage objects: authenticated users can upload only to
  their own folder path: `products/{user_id}/{product_id}/{filename}`
- DELETE on storage objects: authenticated users can delete only from their
  own folder path.

## Important Notes
1. Images are organized by Product ID under each seller's folder:
   `products/{seller_id}/{product_id}/{slot}_{filename}`
2. The four photo slots (front, back, left, right) are preserved in filenames.
3. File type validation (JPG, JPEG, PNG, WEBP) is enforced client-side and
   should also be validated server-side in a future prompt.
*/

-- ===== REVOKE ANON ACCESS ON DATA TABLES =====
REVOKE ALL ON users FROM anon;
REVOKE ALL ON products FROM anon;
REVOKE ALL ON offers FROM anon;

-- ===== CREATE STORAGE BUCKET =====
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', false)
ON CONFLICT (id) DO NOTHING;

-- ===== STORAGE POLICIES =====
-- Allow authenticated users to read (view) product images.
DROP POLICY IF EXISTS "product_images_read" ON storage.objects;
CREATE POLICY "product_images_read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images to their own folder.
-- Path format: products/{auth.uid()}/{product_id}/{filename}
DROP POLICY IF EXISTS "product_images_upload" ON storage.objects;
CREATE POLICY "product_images_upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = 'products'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow authenticated users to delete images from their own folder.
DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
CREATE POLICY "product_images_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = 'products'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
