-- ============================================================================
-- CUSTOM QUOTES SYSTEM - Sistema de Orçamento Personalizado
-- ============================================================================

-- Tabela de orçamentos personalizados
CREATE TABLE IF NOT EXISTS custom_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT UNIQUE NOT NULL, -- Ex: ORÇ-2024-00001
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_company TEXT, -- Para B2B
  description TEXT NOT NULL, -- Descrição da necessidade
  budget_range TEXT, -- Ex: "50.000 - 100.000 Kz"
  use_case TEXT, -- Para que vai usar
  deadline DATE, -- Quando precisa
  status TEXT DEFAULT 'pending', -- pending, in_progress, quoted, approved, rejected, converted, expired
  admin_notes TEXT,
  total_value NUMERIC(10,2),
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  final_value NUMERIC(10,2),
  valid_until DATE, -- Validade da proposta
  converted_order_id TEXT, -- ID do pedido gerado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  quoted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de itens do orçamento
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES custom_quotes(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  custom_price NUMERIC(10,2), -- Preço customizado/negociado
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de histórico de negociação
CREATE TABLE IF NOT EXISTS quote_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES custom_quotes(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- customer, admin
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  proposed_value NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_custom_quotes_email ON custom_quotes(customer_email);
CREATE INDEX IF NOT EXISTS idx_custom_quotes_status ON custom_quotes(status);
CREATE INDEX IF NOT EXISTS idx_custom_quotes_number ON custom_quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_negotiations_quote_id ON quote_negotiations(quote_id);

-- RLS Policies
ALTER TABLE custom_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_negotiations ENABLE ROW LEVEL SECURITY;

-- Políticas para custom_quotes
CREATE POLICY "Users can view own quotes" ON custom_quotes
  FOR SELECT USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "Users can create quotes" ON custom_quotes
  FOR INSERT WITH CHECK (customer_email = auth.jwt()->>'email');

CREATE POLICY "Admins can view all quotes" ON custom_quotes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para quote_items
CREATE POLICY "Users can view items of own quotes" ON quote_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_quotes
      WHERE custom_quotes.id = quote_items.quote_id
      AND custom_quotes.customer_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can manage quote items" ON quote_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para quote_negotiations
CREATE POLICY "Users can view negotiations of own quotes" ON quote_negotiations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_quotes
      WHERE custom_quotes.id = quote_negotiations.quote_id
      AND custom_quotes.customer_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Users can add negotiations to own quotes" ON quote_negotiations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM custom_quotes
      WHERE custom_quotes.id = quote_negotiations.quote_id
      AND custom_quotes.customer_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can manage all negotiations" ON quote_negotiations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Triggers
CREATE TRIGGER update_custom_quotes_updated_at
  BEFORE UPDATE ON custom_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar número de orçamento
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_part TEXT;
  sequence_part INTEGER;
BEGIN
  year_part := TO_CHAR(now(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 'ORÇ-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO sequence_part
  FROM custom_quotes
  WHERE quote_number LIKE 'ORÇ-' || year_part || '-%';
  
  new_number := 'ORÇ-' || year_part || '-' || LPAD(sequence_part::TEXT, 5, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número automaticamente
CREATE OR REPLACE FUNCTION set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quote_number IS NULL THEN
    NEW.quote_number := generate_quote_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_custom_quote_insert
  BEFORE INSERT ON custom_quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_quote_number();

-- Função para calcular totais automaticamente
CREATE OR REPLACE FUNCTION calculate_quote_totals()
RETURNS TRIGGER AS $$
DECLARE
  total NUMERIC(10,2);
BEGIN
  -- Calcular total dos itens
  SELECT COALESCE(SUM(subtotal), 0)
  INTO total
  FROM quote_items
  WHERE quote_id = NEW.id;
  
  -- Atualizar orçamento
  UPDATE custom_quotes
  SET 
    total_value = total,
    final_value = total * (1 - COALESCE(discount_percentage, 0) / 100)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_quote_items_change
  AFTER INSERT OR UPDATE OR DELETE ON quote_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_quote_totals();
