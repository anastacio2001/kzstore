-- ============================================================================
-- ANALYTICS SYSTEM - Sistema de Analytics Avançado
-- ============================================================================

-- Tabela de eventos customizados
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- page_view, product_view, add_to_cart, remove_from_cart, checkout_start, purchase, search
  event_category TEXT, -- user_behavior, conversion, engagement
  user_email TEXT,
  session_id TEXT NOT NULL,
  page_url TEXT,
  page_title TEXT,
  referrer TEXT,
  product_id TEXT,
  product_name TEXT,
  product_price NUMERIC(10,2),
  search_query TEXT,
  cart_value NUMERIC(10,2),
  order_id TEXT,
  order_value NUMERIC(10,2),
  device_type TEXT, -- desktop, mobile, tablet
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB, -- Dados adicionais flexíveis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de funil de conversão
CREATE TABLE IF NOT EXISTS conversion_funnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_email TEXT,
  step_1_page_view BOOLEAN DEFAULT false,
  step_1_timestamp TIMESTAMP WITH TIME ZONE,
  step_2_product_view BOOLEAN DEFAULT false,
  step_2_timestamp TIMESTAMP WITH TIME ZONE,
  step_3_add_to_cart BOOLEAN DEFAULT false,
  step_3_timestamp TIMESTAMP WITH TIME ZONE,
  step_4_checkout_start BOOLEAN DEFAULT false,
  step_4_timestamp TIMESTAMP WITH TIME ZONE,
  step_5_purchase BOOLEAN DEFAULT false,
  step_5_timestamp TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,
  conversion_time_minutes INTEGER,
  abandoned_at_step TEXT,
  order_id TEXT,
  order_value NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de produtos mais vistos
CREATE TABLE IF NOT EXISTS product_analytics (
  product_id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  total_add_to_cart INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0, -- % de visitas que viraram compras
  avg_time_on_page INTEGER DEFAULT 0, -- segundos
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  last_viewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de sessões de usuário
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_email TEXT,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  pages_visited INTEGER DEFAULT 0,
  products_viewed INTEGER DEFAULT 0,
  cart_value NUMERIC(10,2) DEFAULT 0,
  converted BOOLEAN DEFAULT false,
  order_id TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de heatmap (simulação de cliques)
CREATE TABLE IF NOT EXISTS heatmap_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  element_id TEXT,
  element_class TEXT,
  element_tag TEXT,
  click_x INTEGER NOT NULL,
  click_y INTEGER NOT NULL,
  viewport_width INTEGER,
  viewport_height INTEGER,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_email, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product ON analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_session ON conversion_funnel(session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_completed ON conversion_funnel(completed, created_at);
CREATE INDEX IF NOT EXISTS idx_product_analytics_views ON product_analytics(total_views DESC);
CREATE INDEX IF NOT EXISTS idx_product_analytics_revenue ON product_analytics(total_revenue DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_email ON user_sessions(user_email, start_time);
CREATE INDEX IF NOT EXISTS idx_heatmap_clicks_page ON heatmap_clicks(page_url, created_at);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE heatmap_clicks ENABLE ROW LEVEL SECURITY;

-- Políticas para analytics_events (qualquer um pode inserir, admin vê tudo)
CREATE POLICY "Anyone can track events" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own events" ON analytics_events
  FOR SELECT USING (user_email = auth.jwt()->>'email');

CREATE POLICY "Admins can view all events" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para conversion_funnel
CREATE POLICY "Anyone can track funnel" ON conversion_funnel
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view funnel" ON conversion_funnel
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "System can update funnel" ON conversion_funnel
  FOR UPDATE USING (true);

-- Políticas para product_analytics (admin apenas)
CREATE POLICY "Admins can view product analytics" ON product_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "System can update product analytics" ON product_analytics
  FOR ALL USING (true);

-- Políticas para user_sessions
CREATE POLICY "Anyone can create sessions" ON user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (user_email = auth.jwt()->>'email');

CREATE POLICY "Admins can view all sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para heatmap_clicks
CREATE POLICY "Anyone can track clicks" ON heatmap_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view heatmap" ON heatmap_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Triggers
CREATE TRIGGER update_conversion_funnel_updated_at
  BEFORE UPDATE ON conversion_funnel
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_analytics_updated_at
  BEFORE UPDATE ON product_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar analytics de produto
CREATE OR REPLACE FUNCTION update_product_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir ou atualizar estatísticas
  INSERT INTO product_analytics (product_id, product_name, total_views, last_viewed)
  VALUES (NEW.product_id, NEW.product_name, 1, now())
  ON CONFLICT (product_id) DO UPDATE SET
    total_views = product_analytics.total_views + 1,
    last_viewed = now();
  
  -- Se for add_to_cart
  IF NEW.event_type = 'add_to_cart' THEN
    UPDATE product_analytics
    SET total_add_to_cart = total_add_to_cart + 1
    WHERE product_id = NEW.product_id;
  END IF;
  
  -- Se for purchase
  IF NEW.event_type = 'purchase' THEN
    UPDATE product_analytics
    SET 
      total_purchases = total_purchases + 1,
      total_revenue = total_revenue + COALESCE(NEW.product_price, 0),
      conversion_rate = (total_purchases + 1) * 100.0 / NULLIF(total_views, 0)
    WHERE product_id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_analytics_event_insert
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  WHEN (NEW.event_type IN ('product_view', 'add_to_cart', 'purchase'))
  EXECUTE FUNCTION update_product_analytics();

-- Função para atualizar funil de conversão
CREATE OR REPLACE FUNCTION update_conversion_funnel_step()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar ou atualizar funil baseado no tipo de evento
  INSERT INTO conversion_funnel (session_id, user_email)
  VALUES (NEW.session_id, NEW.user_email)
  ON CONFLICT (session_id) DO NOTHING;
  
  -- Atualizar o passo correspondente
  CASE NEW.event_type
    WHEN 'page_view' THEN
      UPDATE conversion_funnel
      SET step_1_page_view = true, step_1_timestamp = now()
      WHERE session_id = NEW.session_id;
    
    WHEN 'product_view' THEN
      UPDATE conversion_funnel
      SET step_2_product_view = true, step_2_timestamp = now()
      WHERE session_id = NEW.session_id;
    
    WHEN 'add_to_cart' THEN
      UPDATE conversion_funnel
      SET step_3_add_to_cart = true, step_3_timestamp = now()
      WHERE session_id = NEW.session_id;
    
    WHEN 'checkout_start' THEN
      UPDATE conversion_funnel
      SET step_4_checkout_start = true, step_4_timestamp = now()
      WHERE session_id = NEW.session_id;
    
    WHEN 'purchase' THEN
      UPDATE conversion_funnel
      SET 
        step_5_purchase = true,
        step_5_timestamp = now(),
        completed = true,
        order_id = NEW.order_id,
        order_value = NEW.order_value,
        conversion_time_minutes = EXTRACT(EPOCH FROM (now() - step_1_timestamp)) / 60
      WHERE session_id = NEW.session_id;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_analytics_event_for_funnel
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_conversion_funnel_step();

-- View para dashboard de analytics
CREATE OR REPLACE VIEW analytics_dashboard AS
SELECT
  -- Métricas gerais
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(DISTINCT CASE WHEN user_email IS NOT NULL THEN user_email END) as total_users,
  COUNT(*) as total_events,
  
  -- Métricas de conversão
  COUNT(DISTINCT CASE WHEN event_type = 'product_view' THEN session_id END) as sessions_with_product_view,
  COUNT(DISTINCT CASE WHEN event_type = 'add_to_cart' THEN session_id END) as sessions_with_cart,
  COUNT(DISTINCT CASE WHEN event_type = 'checkout_start' THEN session_id END) as sessions_with_checkout,
  COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN session_id END) as sessions_with_purchase,
  
  -- Taxas de conversão
  ROUND(
    COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN session_id END) * 100.0 /
    NULLIF(COUNT(DISTINCT session_id), 0),
    2
  ) as conversion_rate,
  
  -- Revenue
  SUM(CASE WHEN event_type = 'purchase' THEN order_value ELSE 0 END) as total_revenue,
  AVG(CASE WHEN event_type = 'purchase' THEN order_value END) as avg_order_value
  
FROM analytics_events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
