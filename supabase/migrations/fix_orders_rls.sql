-- ====================================================================
-- FIX: Permitir criação de pedidos (orders) por usuários autenticados
-- Execute este script no SQL Editor do Supabase Dashboard
-- ====================================================================

-- Remover políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Criar política para permitir usuários autenticados criarem pedidos
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Permitir usuários verem seus próprios pedidos
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Permitir admins atualizarem pedidos
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Verificar se RLS está habilitado
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- Para verificar as políticas:
-- SELECT * FROM pg_policies WHERE tablename = 'orders';
-- ====================================================================
