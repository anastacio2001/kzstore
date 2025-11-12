-- ====================================================================
-- VERSÃO SIMPLIFICADA - Números de Pedido Amigáveis
-- Execute linha por linha no SQL Editor do Supabase
-- ====================================================================

-- 1. Adicionar coluna order_number
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;

-- 2. Criar sequência
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1;

-- 3. Criar função para gerar número
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'KZ' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 4. Criar função do trigger
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- 6. Criar índice único
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- ====================================================================
-- PRONTO! Próximos pedidos terão números KZ000001, KZ000002, etc.
-- ====================================================================
