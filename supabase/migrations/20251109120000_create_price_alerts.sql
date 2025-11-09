-- Drop existing table if exists (force drop)
DROP TABLE IF EXISTS public.price_alerts CASCADE;

-- Create price_alerts table
CREATE TABLE public.price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  target_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_price_alerts_user_email ON public.price_alerts(user_email);
CREATE INDEX idx_price_alerts_product_id ON public.price_alerts(product_id);

-- Enable Row Level Security
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own alerts
CREATE POLICY "Users can view own alerts"
  ON public.price_alerts
  FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

-- Users can create alerts
CREATE POLICY "Users can create alerts"
  ON public.price_alerts
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Users can update their own alerts
CREATE POLICY "Users can update own alerts"
  ON public.price_alerts
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = user_email);

-- Users can delete their own alerts
CREATE POLICY "Users can delete own alerts"
  ON public.price_alerts
  FOR DELETE
  USING (auth.jwt() ->> 'email' = user_email);
