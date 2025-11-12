-- ====================================================================
-- CORRIGIR PERMISSÕES RLS PARA TABELA USERS
-- ====================================================================

-- Desabilitar RLS na tabela users para permitir leitura pública
-- (necessário para pré-vendas e outros componentes)
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- OU, se preferir manter RLS mas permitir leitura:
-- DROP POLICY IF EXISTS "Allow public read access" ON users;
-- CREATE POLICY "Allow public read access" ON users
--   FOR SELECT
--   USING (true);

-- Garantir que a tabela pre_sale_products também está acessível
ALTER TABLE IF EXISTS pre_sale_products DISABLE ROW LEVEL SECURITY;

-- Garantir que a tabela pre_sale_reservations também está acessível  
ALTER TABLE IF EXISTS pre_sale_reservations DISABLE ROW LEVEL SECURITY;

-- ====================================================================
-- PRONTO! Permissões corrigidas
-- ====================================================================
