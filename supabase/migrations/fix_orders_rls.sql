-- ====================================================================
-- FIX: Permitir criação de pedidos (orders) - DESABILITAR RLS
-- Execute este script no SQL Editor do Supabase Dashboard
-- ====================================================================

-- OPÇÃO 1: Desabilitar RLS completamente (mais fácil para desenvolvimento)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- OPÇÃO 2: Se quiser manter RLS habilitado, use estas políticas:
-- Remover políticas antigas
-- DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
-- DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
-- DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
-- DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
-- DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Habilitar RLS
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Permitir QUALQUER PESSOA criar pedidos (público)
-- CREATE POLICY "Anyone can create orders"
--   ON orders FOR INSERT
--   WITH CHECK (true);

-- Permitir QUALQUER PESSOA ver pedidos (público)
-- CREATE POLICY "Anyone can view orders"
--   ON orders FOR SELECT
--   USING (true);

-- Permitir usuários autenticados atualizarem pedidos
-- CREATE POLICY "Authenticated users can update orders"
--   ON orders FOR UPDATE
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

-- ====================================================================
-- Para verificar as políticas:
-- SELECT * FROM pg_policies WHERE tablename = 'orders';
-- ====================================================================
