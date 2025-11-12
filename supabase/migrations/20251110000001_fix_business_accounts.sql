-- Fix business_accounts table to match the form fields

-- Add missing columns
ALTER TABLE business_accounts 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS cnpj TEXT,
  ADD COLUMN IF NOT EXISTS trade_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS zip_code TEXT,
  ADD COLUMN IF NOT EXISTS monthly_purchase_volume TEXT,
  ADD COLUMN IF NOT EXISTS business_description TEXT,
  ADD COLUMN IF NOT EXISTS discount_tier INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Make user_email nullable since we now have user_id
ALTER TABLE business_accounts ALTER COLUMN user_email DROP NOT NULL;

-- Update RLS policies to work with user_id
DROP POLICY IF EXISTS "Users can view own business account" ON business_accounts;
DROP POLICY IF EXISTS "Users can create business account" ON business_accounts;
DROP POLICY IF EXISTS "Users can update own pending account" ON business_accounts;

CREATE POLICY "Users can view own business account" ON business_accounts
  FOR SELECT USING (
    user_id = auth.uid() OR 
    user_email = auth.jwt()->>'email'
  );

CREATE POLICY "Users can create business account" ON business_accounts
  FOR INSERT WITH CHECK (true); -- Allow anyone to register

CREATE POLICY "Users can update own pending account" ON business_accounts
  FOR UPDATE USING (
    (user_id = auth.uid() OR user_email = auth.jwt()->>'email')
    AND status = 'pending'
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_accounts_user_id ON business_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_business_accounts_cnpj ON business_accounts(cnpj);

COMMENT ON COLUMN business_accounts.cnpj IS 'NIF (Angola) or CNPJ (Brazil) - tax identification number';
COMMENT ON COLUMN business_accounts.discount_tier IS 'Discount tier level (1-5), each tier = 5% discount';
