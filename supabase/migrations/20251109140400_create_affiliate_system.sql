-- ============================================================================
-- AFFILIATE SYSTEM - Sistema de Afiliados
-- ============================================================================

-- Tabela de afiliados
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT UNIQUE NOT NULL,
  user_name TEXT NOT NULL,
  unique_code TEXT UNIQUE NOT NULL, -- Ex: KZ2024ABC123
  commission_rate NUMERIC(5,2) DEFAULT 5.00, -- Taxa de comissão (5%)
  status TEXT DEFAULT 'active', -- active, suspended, inactive
  payment_method TEXT, -- multicaixa, iban, paypal
  payment_details JSONB, -- Dados de pagamento
  total_clicks INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  total_commission NUMERIC(12,2) DEFAULT 0,
  paid_commission NUMERIC(12,2) DEFAULT 0,
  pending_commission NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de links de afiliados
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  url_params TEXT NOT NULL, -- ref=CODIGO123
  full_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de cliques rastreados
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  link_id UUID REFERENCES affiliate_links(id) ON DELETE SET NULL,
  ref_code TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  converted BOOLEAN DEFAULT false,
  order_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de vendas de afiliados
CREATE TABLE IF NOT EXISTS affiliate_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  click_id UUID REFERENCES affiliate_clicks(id) ON DELETE SET NULL,
  order_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  order_amount NUMERIC(12,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, paid
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de pagamentos de afiliados
CREATE TABLE IF NOT EXISTS affiliate_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number TEXT UNIQUE NOT NULL,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sales INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  processed_by TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(user_email);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(unique_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_affiliate ON affiliate_links(affiliate_id, is_active);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_ref ON affiliate_clicks(ref_code, created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON affiliate_clicks(affiliate_id, converted);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_affiliate ON affiliate_sales(affiliate_id, status);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_order ON affiliate_sales(order_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_affiliate ON affiliate_payments(affiliate_id);

-- RLS Policies
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payments ENABLE ROW LEVEL SECURITY;

-- Políticas para affiliates
CREATE POLICY "Users can view own affiliate data" ON affiliates
  FOR SELECT USING (user_email = auth.jwt()->>'email');

CREATE POLICY "Users can create affiliate account" ON affiliates
  FOR INSERT WITH CHECK (user_email = auth.jwt()->>'email');

CREATE POLICY "Users can update own affiliate data" ON affiliates
  FOR UPDATE USING (user_email = auth.jwt()->>'email');

CREATE POLICY "Admins can manage all affiliates" ON affiliates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para affiliate_links
CREATE POLICY "Users can view own links" ON affiliate_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM affiliates
      WHERE affiliates.id = affiliate_links.affiliate_id
      AND affiliates.user_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Users can create own links" ON affiliate_links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM affiliates
      WHERE affiliates.id = affiliate_links.affiliate_id
      AND affiliates.user_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can manage all links" ON affiliate_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para affiliate_clicks (público pode inserir, afiliados veem seus)
CREATE POLICY "Anyone can track clicks" ON affiliate_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own clicks" ON affiliate_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM affiliates
      WHERE affiliates.id = affiliate_clicks.affiliate_id
      AND affiliates.user_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can view all clicks" ON affiliate_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para affiliate_sales
CREATE POLICY "Users can view own sales" ON affiliate_sales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM affiliates
      WHERE affiliates.id = affiliate_sales.affiliate_id
      AND affiliates.user_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can manage all sales" ON affiliate_sales
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para affiliate_payments
CREATE POLICY "Users can view own payments" ON affiliate_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM affiliates
      WHERE affiliates.id = affiliate_payments.affiliate_id
      AND affiliates.user_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can manage all payments" ON affiliate_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Triggers
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar código único de afiliado
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Gerar código: KZ + ano + 6 caracteres aleatórios
    new_code := 'KZ' || TO_CHAR(now(), 'YY') || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Verificar se código já existe
    SELECT EXISTS(SELECT 1 FROM affiliates WHERE unique_code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar código automaticamente
CREATE OR REPLACE FUNCTION set_affiliate_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unique_code IS NULL OR NEW.unique_code = '' THEN
    NEW.unique_code := generate_affiliate_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_affiliate_insert
  BEFORE INSERT ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION set_affiliate_code();

-- Função para registrar venda de afiliado
CREATE OR REPLACE FUNCTION record_affiliate_sale()
RETURNS TRIGGER AS $$
DECLARE
  aff_click RECORD;
  aff_record RECORD;
  commission NUMERIC(12,2);
BEGIN
  -- Procurar clique do afiliado nos últimos 30 dias
  SELECT * INTO aff_click
  FROM affiliate_clicks
  WHERE order_id IS NULL
    AND converted = false
    AND created_at > now() - INTERVAL '30 days'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF FOUND THEN
    -- Buscar dados do afiliado
    SELECT * INTO aff_record
    FROM affiliates
    WHERE id = aff_click.affiliate_id;
    
    -- Calcular comissão
    commission := NEW.total_amount * (aff_record.commission_rate / 100);
    
    -- Registrar venda
    INSERT INTO affiliate_sales (
      affiliate_id,
      click_id,
      order_id,
      customer_email,
      order_amount,
      commission_rate,
      commission_amount,
      status
    ) VALUES (
      aff_click.affiliate_id,
      aff_click.id,
      NEW.id,
      NEW.customer_email,
      NEW.total_amount,
      aff_record.commission_rate,
      commission,
      'pending'
    );
    
    -- Atualizar clique como convertido
    UPDATE affiliate_clicks
    SET converted = true, order_id = NEW.id
    WHERE id = aff_click.id;
    
    -- Atualizar estatísticas do afiliado
    UPDATE affiliates
    SET 
      total_sales = total_sales + 1,
      total_revenue = total_revenue + NEW.total_amount,
      total_commission = total_commission + commission,
      pending_commission = pending_commission + commission
    WHERE id = aff_click.affiliate_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar número de pagamento
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_part TEXT;
  sequence_part INTEGER;
BEGIN
  year_part := TO_CHAR(now(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 'PAG-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO sequence_part
  FROM affiliate_payments
  WHERE payment_number LIKE 'PAG-' || year_part || '-%';
  
  new_number := 'PAG-' || year_part || '-' || LPAD(sequence_part::TEXT, 5, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número de pagamento
CREATE OR REPLACE FUNCTION set_payment_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_number IS NULL THEN
    NEW.payment_number := generate_payment_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_affiliate_payment_insert
  BEFORE INSERT ON affiliate_payments
  FOR EACH ROW
  EXECUTE FUNCTION set_payment_number();
