-- ============================================
-- POLÍTICAS DE STORAGE PARA TICKET-ATTACHMENTS
-- ============================================

-- Permitir upload de arquivos (INSERT)
-- Qualquer usuário autenticado pode fazer upload na sua própria pasta
CREATE POLICY "Users can upload files to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ticket-attachments' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir visualização de arquivos (SELECT)
-- Qualquer pessoa pode ver os arquivos (bucket público)
CREATE POLICY "Anyone can view ticket attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ticket-attachments');

-- Permitir deleção (DELETE)
-- Usuários podem deletar apenas seus próprios arquivos
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ticket-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- INSTRUÇÕES DE APLICAÇÃO
-- ============================================
-- 
-- ESTAS POLÍTICAS DEVEM SER CRIADAS NO DASHBOARD DO SUPABASE:
-- 
-- 1. Acesse: https://supabase.com/dashboard/project/duxeeawfyxcciwlyjllk/storage/policies
-- 2. Selecione o bucket 'ticket-attachments'
-- 3. Clique em "New Policy"
-- 4. Para cada política acima:
--    - Cole o código SQL
--    - Clique em "Review"
--    - Clique em "Save policy"
-- 
-- OU execute via SQL Editor:
-- https://supabase.com/dashboard/project/duxeeawfyxcciwlyjllk/sql/new
