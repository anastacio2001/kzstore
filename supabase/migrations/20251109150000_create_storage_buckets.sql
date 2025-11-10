-- Create storage bucket for product images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for trade-in images
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-in', 'trade-in', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for products bucket
CREATE POLICY "Public Access to products bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload to products"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Authenticated users can update their products"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can delete their products"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- Set up storage policies for trade-in bucket
CREATE POLICY "Public Access to trade-in bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'trade-in');

CREATE POLICY "Authenticated users can upload to trade-in"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'trade-in');

CREATE POLICY "Users can view their own trade-in images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'trade-in');
