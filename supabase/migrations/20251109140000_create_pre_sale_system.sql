-- ============================================================================
-- PRE-SALE SYSTEM - Sistema de Pré-Venda
-- ============================================================================

-- Tabela de produtos em pré-venda
CREATE TABLE IF NOT EXISTS pre_sale_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  release_date TIMESTAMP WITH TIME ZONE NOT NULL,
  deposit_percentage NUMERIC(5,2) NOT NULL DEFAULT 30.00, -- Ex: 30% de sinal
  stock_limit INTEGER NOT NULL,
  stock_reserved INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de reservas de pré-venda
CREATE TABLE IF NOT EXISTS pre_sale_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_sale_id UUID REFERENCES pre_sale_products(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price NUMERIC(10,2) NOT NULL,
  deposit_amount NUMERIC(10,2) NOT NULL,
  remaining_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, deposit_paid, completed, cancelled
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de lista de espera
CREATE TABLE IF NOT EXISTS waiting_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  notify_when_available BOOLEAN DEFAULT true,
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pre_sale_products_active ON pre_sale_products(is_active, release_date);
CREATE INDEX IF NOT EXISTS idx_pre_sale_reservations_email ON pre_sale_reservations(customer_email);
CREATE INDEX IF NOT EXISTS idx_pre_sale_reservations_status ON pre_sale_reservations(status);
CREATE INDEX IF NOT EXISTS idx_waiting_list_product ON waiting_list(product_id, notified);
CREATE INDEX IF NOT EXISTS idx_waiting_list_email ON waiting_list(customer_email);

-- RLS Policies
ALTER TABLE pre_sale_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_sale_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;

-- Políticas para pre_sale_products (público pode ver, admin pode gerenciar)
CREATE POLICY "Anyone can view active pre-sales" ON pre_sale_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage pre-sales" ON pre_sale_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para pre_sale_reservations (usuários veem suas próprias, admin vê todas)
CREATE POLICY "Users can view own reservations" ON pre_sale_reservations
  FOR SELECT USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "Users can create reservations" ON pre_sale_reservations
  FOR INSERT WITH CHECK (customer_email = auth.jwt()->>'email');

CREATE POLICY "Admins can view all reservations" ON pre_sale_reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update reservations" ON pre_sale_reservations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para waiting_list
CREATE POLICY "Users can view own waiting list entries" ON waiting_list
  FOR SELECT USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "Users can add to waiting list" ON waiting_list
  FOR INSERT WITH CHECK (customer_email = auth.jwt()->>'email');

CREATE POLICY "Users can delete own waiting list entries" ON waiting_list
  FOR DELETE USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "Admins can view all waiting list" ON waiting_list
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_pre_sale_products_updated_at
  BEFORE UPDATE ON pre_sale_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pre_sale_reservations_updated_at
  BEFORE UPDATE ON pre_sale_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para decrementar estoque ao criar reserva
CREATE OR REPLACE FUNCTION decrement_pre_sale_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pre_sale_products
  SET stock_reserved = stock_reserved + 1
  WHERE id = NEW.pre_sale_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_pre_sale_reservation_created
  AFTER INSERT ON pre_sale_reservations
  FOR EACH ROW
  EXECUTE FUNCTION decrement_pre_sale_stock();
