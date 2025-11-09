-- ==================================================
-- CRIAR BUCKET PARA IMAGENS DE ANÚNCIOS
-- ==================================================

-- Criar bucket público para imagens de anúncios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ad-images',
  'ad-images',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[];

-- ==================================================
-- POLÍTICAS DE STORAGE (RLS)
-- ==================================================
-- Nota: Como o bucket é público, as políticas são opcionais
-- O código abaixo está comentado para evitar erros

-- Para criar políticas de storage manualmente, use o Dashboard:
-- Storage > ad-images > Policies > New Policy

-- Exemplos de políticas (NÃO execute no SQL Editor):
-- 
-- Leitura pública:
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'ad-images');
--
-- Upload autenticado:
-- CREATE POLICY "Authenticated Upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'ad-images' AND auth.role() = 'authenticated');
--
-- Delete autenticado:
-- CREATE POLICY "Authenticated Delete"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'ad-images' AND auth.role() = 'authenticated');
