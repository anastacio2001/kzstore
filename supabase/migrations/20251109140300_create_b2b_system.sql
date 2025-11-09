-- ============================================================================
-- B2B SYSTEM - Sistema de Vendas Corporativas
-- ============================================================================

-- Tabela de contas empresariais
CREATE TABLE IF NOT EXISTS business_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  tax_id TEXT UNIQUE NOT NULL, -- NIF/CNPJ
  industry TEXT NOT NULL, -- Tecnologia, Saúde, Educação, etc
  company_size TEXT, -- 1-10, 11-50, 51-200, 200+
  website TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT DEFAULT 'Angola',
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, suspended
  approved_by TEXT, -- Email do admin que aprovou
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  credit_limit NUMERIC(12,2) DEFAULT 0, -- Limite de crédito aprovado
  payment_terms INTEGER DEFAULT 30, -- Prazo de pagamento em dias (30, 60, 90)
  discount_percentage NUMERIC(5,2) DEFAULT 0, -- Desconto padrão B2B
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de precificação B2B por volume
CREATE TABLE IF NOT EXISTS b2b_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,
  discount_percentage NUMERIC(5,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de faturas B2B
CREATE TABLE IF NOT EXISTS b2b_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  account_id UUID REFERENCES business_accounts(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  tax_id TEXT NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  invoice_pdf_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, paid, overdue, cancelled
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de pedidos B2B (bulk orders)
CREATE TABLE IF NOT EXISTS b2b_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  account_id UUID REFERENCES business_accounts(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  total_items INTEGER NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, processing, shipped, delivered, cancelled
  payment_terms INTEGER, -- Prazo de pagamento
  delivery_address TEXT NOT NULL,
  special_instructions TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de itens de pedidos B2B
CREATE TABLE IF NOT EXISTS b2b_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES b2b_orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_business_accounts_email ON business_accounts(user_email);
CREATE INDEX IF NOT EXISTS idx_business_accounts_status ON business_accounts(status);
CREATE INDEX IF NOT EXISTS idx_business_accounts_tax_id ON business_accounts(tax_id);
CREATE INDEX IF NOT EXISTS idx_b2b_pricing_product ON b2b_pricing(product_id, is_active);
CREATE INDEX IF NOT EXISTS idx_b2b_invoices_account ON b2b_invoices(account_id);
CREATE INDEX IF NOT EXISTS idx_b2b_invoices_status ON b2b_invoices(status);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_account ON b2b_orders(account_id);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_status ON b2b_orders(status);

-- RLS Policies
ALTER TABLE business_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para business_accounts
CREATE POLICY "Users can view own business account" ON business_accounts
  FOR SELECT USING (user_email = auth.jwt()->>'email');

CREATE POLICY "Users can create business account" ON business_accounts
  FOR INSERT WITH CHECK (user_email = auth.jwt()->>'email');

CREATE POLICY "Users can update own pending account" ON business_accounts
  FOR UPDATE USING (
    user_email = auth.jwt()->>'email' 
    AND status = 'pending'
  );

CREATE POLICY "Admins can manage all business accounts" ON business_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para b2b_pricing (público pode ver, admin gerencia)
CREATE POLICY "Anyone can view active B2B pricing" ON b2b_pricing
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage B2B pricing" ON b2b_pricing
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para b2b_invoices
CREATE POLICY "Users can view own invoices" ON b2b_invoices
  FOR SELECT USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "Admins can manage all invoices" ON b2b_invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para b2b_orders
CREATE POLICY "Users can view own B2B orders" ON b2b_orders
  FOR SELECT USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "Users can create B2B orders" ON b2b_orders
  FOR INSERT WITH CHECK (customer_email = auth.jwt()->>'email');

CREATE POLICY "Admins can manage all B2B orders" ON b2b_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para b2b_order_items
CREATE POLICY "Users can view items of own orders" ON b2b_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM b2b_orders
      WHERE b2b_orders.id = b2b_order_items.order_id
      AND b2b_orders.customer_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can manage all order items" ON b2b_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Triggers
CREATE TRIGGER update_business_accounts_updated_at
  BEFORE UPDATE ON business_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_b2b_orders_updated_at
  BEFORE UPDATE ON b2b_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar número de fatura
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_part TEXT;
  sequence_part INTEGER;
BEGIN
  year_part := TO_CHAR(now(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'FT-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO sequence_part
  FROM b2b_invoices
  WHERE invoice_number LIKE 'FT-' || year_part || '-%';
  
  new_number := 'FT-' || year_part || '-' || LPAD(sequence_part::TEXT, 5, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número de fatura
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_b2b_invoice_insert
  BEFORE INSERT ON b2b_invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- Função para gerar número de pedido B2B
CREATE OR REPLACE FUNCTION generate_b2b_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_part TEXT;
  sequence_part INTEGER;
BEGIN
  year_part := TO_CHAR(now(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'B2B-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO sequence_part
  FROM b2b_orders
  WHERE order_number LIKE 'B2B-' || year_part || '-%';
  
  new_number := 'B2B-' || year_part || '-' || LPAD(sequence_part::TEXT, 5, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número de pedido B2B
CREATE OR REPLACE FUNCTION set_b2b_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_b2b_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_b2b_order_insert
  BEFORE INSERT ON b2b_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_b2b_order_number();
