-- ====================================================================
-- INCREMENTAR CONTADOR DE USO DE CUPONS AUTOMATICAMENTE
-- Execute no SQL Editor do Supabase
-- ====================================================================

-- Função para incrementar used_count quando cupom é usado
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o pedido tem um coupon_code, incrementar o contador
  IF NEW.coupon_code IS NOT NULL AND NEW.coupon_code != '' THEN
    UPDATE coupons
    SET used_count = used_count + 1
    WHERE code = NEW.coupon_code;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para incrementar automaticamente após INSERT
DROP TRIGGER IF EXISTS trigger_increment_coupon_usage ON orders;
CREATE TRIGGER trigger_increment_coupon_usage
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION increment_coupon_usage();

-- ====================================================================
-- PRONTO! Agora o used_count é incrementado automaticamente
-- ====================================================================
