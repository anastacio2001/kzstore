-- Create price_alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  current_price NUMERIC NOT NULL,
  target_price NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_email ON price_alerts(user_email);
CREATE INDEX IF NOT EXISTS idx_price_alerts_product_id ON price_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_is_active ON price_alerts(is_active);

-- Enable Row Level Security
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own alerts
CREATE POLICY "Users can view own alerts"
  ON price_alerts
  FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

-- Users can create alerts
CREATE POLICY "Users can create alerts"
  ON price_alerts
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Users can update their own alerts
CREATE POLICY "Users can update own alerts"
  ON price_alerts
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = user_email);

-- Users can delete their own alerts
CREATE POLICY "Users can delete own alerts"
  ON price_alerts
  FOR DELETE
  USING (auth.jwt() ->> 'email' = user_email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_price_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER price_alerts_updated_at
  BEFORE UPDATE ON price_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_price_alerts_updated_at();
