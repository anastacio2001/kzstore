-- ============================================================================
-- EMAIL MARKETING SYSTEM - Sistema de Email Marketing
-- ============================================================================

-- Tabela de inscritos
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active', -- active, unsubscribed, bounced, complained
  source TEXT, -- newsletter, checkout, blog, popup
  tags TEXT[], -- [tech, smartphones, laptops, promocoes]
  preferences JSONB, -- {frequency: 'weekly', categories: ['tech']}
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  last_email_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de campanhas
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  content TEXT NOT NULL, -- HTML do email
  segment TEXT, -- all, tech_lovers, recent_buyers, inactive_users
  tags_filter TEXT[], -- Filtrar por tags
  status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent, cancelled
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de automações
CREATE TABLE IF NOT EXISTS email_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- cart_abandoned, product_viewed, post_purchase, reengagement
  trigger_config JSONB NOT NULL, -- {delay_hours: 2, conditions: {...}}
  email_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  total_triggered INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de envios (tracking individual)
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  automation_id UUID REFERENCES email_automations(id) ON DELETE SET NULL,
  subscriber_id UUID REFERENCES email_subscribers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, complained
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT
);

-- Tabela de cliques em emails
CREATE TABLE IF NOT EXISTS email_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id UUID REFERENCES email_sends(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Tabela de carrinho abandonado (trigger)
CREATE TABLE IF NOT EXISTS cart_abandoned_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  cart_items JSONB NOT NULL, -- [{product_id, name, price, quantity}]
  cart_total NUMERIC(10,2) NOT NULL,
  abandoned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  first_email_sent BOOLEAN DEFAULT false,
  first_email_sent_at TIMESTAMP WITH TIME ZONE,
  second_email_sent BOOLEAN DEFAULT false,
  second_email_sent_at TIMESTAMP WITH TIME ZONE,
  third_email_sent BOOLEAN DEFAULT false,
  third_email_sent_at TIMESTAMP WITH TIME ZONE,
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMP WITH TIME ZONE,
  order_id TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_tags ON email_subscribers USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_automations_active ON email_automations(is_active, trigger_type);
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign ON email_sends(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_email_sends_email ON email_sends(email, sent_at);
CREATE INDEX IF NOT EXISTS idx_cart_abandoned_email ON cart_abandoned_triggers(customer_email, recovered);

-- RLS Policies
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_abandoned_triggers ENABLE ROW LEVEL SECURITY;

-- Políticas para email_subscribers
CREATE POLICY "Anyone can subscribe" ON email_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own subscription" ON email_subscribers
  FOR SELECT USING (email = auth.jwt()->>'email');

CREATE POLICY "Users can update own subscription" ON email_subscribers
  FOR UPDATE USING (email = auth.jwt()->>'email');

CREATE POLICY "Admins can manage all subscribers" ON email_subscribers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para email_campaigns (apenas admin)
CREATE POLICY "Admins can manage campaigns" ON email_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para email_automations (apenas admin)
CREATE POLICY "Admins can manage automations" ON email_automations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para email_sends (admin e próprio usuário)
CREATE POLICY "Users can view own email sends" ON email_sends
  FOR SELECT USING (email = auth.jwt()->>'email');

CREATE POLICY "Admins can manage all sends" ON email_sends
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para email_clicks (admin e próprio usuário)
CREATE POLICY "Users can view own clicks" ON email_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM email_sends
      WHERE email_sends.id = email_clicks.send_id
      AND email_sends.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can view all clicks" ON email_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para cart_abandoned_triggers (apenas admin)
CREATE POLICY "Admins can manage cart triggers" ON cart_abandoned_triggers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Triggers
CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_automations_updated_at
  BEFORE UPDATE ON email_automations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar estatísticas da campanha
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE email_campaigns
    SET total_sent = total_sent + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    UPDATE email_campaigns
    SET total_delivered = total_delivered + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  IF NEW.status = 'opened' AND (OLD.status IS NULL OR OLD.status != 'opened') THEN
    UPDATE email_campaigns
    SET total_opened = total_opened + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  IF NEW.status = 'clicked' AND (OLD.status IS NULL OR OLD.status != 'clicked') THEN
    UPDATE email_campaigns
    SET total_clicked = total_clicked + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  IF NEW.status = 'bounced' AND (OLD.status IS NULL OR OLD.status != 'bounced') THEN
    UPDATE email_campaigns
    SET total_bounced = total_bounced + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_email_send_change
  AFTER INSERT OR UPDATE ON email_sends
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_stats();

-- Função para registrar clique
CREATE OR REPLACE FUNCTION track_email_click()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar status do envio para 'clicked' se ainda não foi
  UPDATE email_sends
  SET 
    status = 'clicked',
    clicked_at = COALESCE(clicked_at, now())
  WHERE id = NEW.send_id
    AND status != 'clicked';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_email_click_insert
  AFTER INSERT ON email_clicks
  FOR EACH ROW
  EXECUTE FUNCTION track_email_click();
