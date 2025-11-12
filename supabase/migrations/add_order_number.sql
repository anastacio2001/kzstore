-- ====================================================================
-- ADICIONAR NÚMERO DE PEDIDO SEQUENCIAL E AMIGÁVEL
-- Execute este script no SQL Editor do Supabase Dashboard
-- ====================================================================

-- Adicionar coluna order_number (número amigável do pedido)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;

-- Criar sequência para números de pedido
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1;

-- Criar função para gerar número de pedido formatado
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  order_num TEXT;
BEGIN
  next_num := nextval('order_number_seq');
  order_num := 'KZ' || LPAD(next_num::TEXT, 6, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para gerar número automaticamente
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar trigger na tabela orders
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Atualizar pedidos existentes com números amigáveis
UPDATE orders 
SET order_number = 'KZ' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')
WHERE order_number IS NULL;

-- Criar índice único para order_number
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- ====================================================================
-- Agora os pedidos terão números como: KZ000001, KZ000002, KZ000003...
-- O UUID ainda existe como ID interno, mas o order_number é exibido ao usuário
-- ====================================================================

-- Para verificar:
-- SELECT id, order_number, customer_name, total, created_at FROM orders ORDER BY created_at DESC LIMIT 10;
