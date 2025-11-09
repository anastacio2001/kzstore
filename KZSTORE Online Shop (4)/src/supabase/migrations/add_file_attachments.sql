-- ADICIONAR SUPORTE PARA ANEXOS DE ARQUIVOS

-- 1. Criar bucket de storage no Supabase (via dashboard ou SQL)
-- Depois de criar, copie este SQL para dar permissões:

-- Políticas para o bucket 'ticket-attachments'
-- IMPORTANTE: Criar o bucket primeiro no Dashboard: Storage > Create bucket > ticket-attachments

-- 2. Alterar tabela ticket_messages para usar TEXT[] em vez de JSONB (mais simples)
-- Já está criado, só garantir que aceita arrays de URLs

-- 3. Permitir que authenticated faça upload
-- As políticas de storage devem ser criadas no dashboard:
-- Storage > ticket-attachments > Policies

-- Policy: "Users can upload to their tickets"
-- INSERT policy:
-- WITH CHECK (
--   bucket_id = 'ticket-attachments' 
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- )

-- Policy: "Users can view attachments from their tickets"  
-- SELECT policy:
-- USING (
--   bucket_id = 'ticket-attachments'
-- )

-- Policy: "Users can delete their own uploads"
-- DELETE policy:
-- USING (
--   bucket_id = 'ticket-attachments'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- )

-- 4. Garantir que attachments aceita URLs
-- A coluna já existe como TEXT[], perfeito!

COMMENT ON COLUMN ticket_messages.attachments IS 'Array de URLs públicas dos arquivos anexados (Supabase Storage)';
