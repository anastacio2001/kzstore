-- ====================================================================
-- TRIGGER PARA ENVIAR NOTIFICAÇÕES POR EMAIL
-- Quando status do pedido muda, envia email automático
-- ====================================================================

-- Função para enviar notificação de email (via webhook ou Edge Function)
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://duxeeawfyxcciwlyjllk.supabase.co/functions/v1/send-order-notification';
BEGIN
  -- Só notificar se o status mudou
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Fazer requisição HTTP para Edge Function (async)
    -- Isso será implementado via trigger HTTP extension ou Edge Function
    PERFORM http_post(
      webhook_url,
      jsonb_build_object(
        'order_id', NEW.id,
        'order_number', NEW.order_number,
        'customer_email', NEW.customer_email,
        'customer_name', NEW.customer_name,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'total', NEW.total
      )::text,
      'application/json'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificações automáticas
DROP TRIGGER IF EXISTS trigger_notify_order_status ON orders;
CREATE TRIGGER trigger_notify_order_status
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();

-- ====================================================================
-- NOTA: Para funcionar completamente, você precisa:
-- 1. Instalar extensão pgsql-http no Supabase
-- 2. Criar Edge Function send-order-notification
-- 3. Configurar serviço de email (SendGrid, Resend, etc)
-- ====================================================================
