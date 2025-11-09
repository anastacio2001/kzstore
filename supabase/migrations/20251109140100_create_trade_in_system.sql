-- ============================================================================
-- TRADE-IN SYSTEM - Programa de Troca
-- ============================================================================

-- Tabela de solicitações de trade-in
CREATE TABLE IF NOT EXISTS trade_in_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  product_model TEXT NOT NULL, -- Modelo do produto que quer trocar
  product_brand TEXT NOT NULL,
  product_condition TEXT NOT NULL, -- Excelente, Bom, Aceitável, Ruim
  product_year INTEGER,
  has_box BOOLEAN DEFAULT false,
  has_accessories BOOLEAN DEFAULT false,
  description TEXT,
  images TEXT[], -- Array de URLs das fotos
  estimated_value NUMERIC(10,2), -- Valor estimado pelo sistema
  status TEXT DEFAULT 'pending', -- pending, evaluating, approved, rejected, device_received, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de avaliações de trade-in (admin)
CREATE TABLE IF NOT EXISTS trade_in_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES trade_in_requests(id) ON DELETE CASCADE,
  final_value NUMERIC(10,2) NOT NULL,
  approved_by TEXT NOT NULL, -- Email do admin
  evaluation_notes TEXT,
  conditions_found TEXT, -- Estado real encontrado
  discount_reasons TEXT[], -- Motivos de descontos aplicados
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de créditos de trade-in
CREATE TABLE IF NOT EXISTS trade_in_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  request_id UUID REFERENCES trade_in_requests(id) ON DELETE CASCADE,
  evaluation_id UUID REFERENCES trade_in_evaluations(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL,
  used_amount NUMERIC(10,2) DEFAULT 0.00,
  remaining_amount NUMERIC(10,2) NOT NULL,
  order_id TEXT, -- ID do pedido onde foi usado
  status TEXT DEFAULT 'available', -- available, partially_used, fully_used, expired
  expires_at TIMESTAMP WITH TIME ZONE, -- Crédito expira em X meses
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_trade_in_requests_email ON trade_in_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_trade_in_requests_status ON trade_in_requests(status);
CREATE INDEX IF NOT EXISTS idx_trade_in_credits_email ON trade_in_credits(customer_email);
CREATE INDEX IF NOT EXISTS idx_trade_in_credits_status ON trade_in_credits(status);

-- RLS Policies
ALTER TABLE trade_in_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_credits ENABLE ROW LEVEL SECURITY;

-- Políticas para trade_in_requests
CREATE POLICY "Users can view own trade-in requests" ON trade_in_requests
  FOR SELECT USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "Users can create trade-in requests" ON trade_in_requests
  FOR INSERT WITH CHECK (customer_email = auth.jwt()->>'email');

CREATE POLICY "Admins can view all trade-in requests" ON trade_in_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para trade_in_evaluations (apenas admin)
CREATE POLICY "Admins can manage evaluations" ON trade_in_evaluations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para trade_in_credits
CREATE POLICY "Users can view own credits" ON trade_in_credits
  FOR SELECT USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "Admins can manage all credits" ON trade_in_credits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Triggers
CREATE TRIGGER update_trade_in_requests_updated_at
  BEFORE UPDATE ON trade_in_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para criar crédito automaticamente após aprovação
CREATE OR REPLACE FUNCTION create_trade_in_credit()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir crédito quando avaliação é criada
  INSERT INTO trade_in_credits (
    customer_email,
    request_id,
    evaluation_id,
    total_amount,
    remaining_amount,
    expires_at
  )
  SELECT
    tr.customer_email,
    tr.id,
    NEW.id,
    NEW.final_value,
    NEW.final_value,
    now() + INTERVAL '6 months' -- Crédito válido por 6 meses
  FROM trade_in_requests tr
  WHERE tr.id = NEW.request_id;
  
  -- Atualizar status da solicitação
  UPDATE trade_in_requests
  SET status = 'approved'
  WHERE id = NEW.request_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_trade_in_evaluation_approved
  AFTER INSERT ON trade_in_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION create_trade_in_credit();
