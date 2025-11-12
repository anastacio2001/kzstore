-- Fix RLS policies for business_accounts to allow anonymous registrations

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own business account" ON business_accounts;
DROP POLICY IF EXISTS "Users can create business account" ON business_accounts;
DROP POLICY IF EXISTS "Users can update own pending account" ON business_accounts;
DROP POLICY IF EXISTS "Admins can manage all business accounts" ON business_accounts;

-- Allow anyone (even anonymous) to create a business account registration
CREATE POLICY "Anyone can create business account" ON business_accounts
  FOR INSERT WITH CHECK (true);

-- Users can view their own accounts
CREATE POLICY "Users can view own business account" ON business_accounts
  FOR SELECT USING (
    user_id = auth.uid() OR 
    user_email = auth.jwt()->>'email' OR
    contact_email = auth.jwt()->>'email'
  );

-- Users can update their own pending accounts
CREATE POLICY "Users can update own pending account" ON business_accounts
  FOR UPDATE USING (
    (user_id = auth.uid() OR 
     user_email = auth.jwt()->>'email' OR
     contact_email = auth.jwt()->>'email')
    AND status = 'pending'
  );

-- Admins can do everything
CREATE POLICY "Admins can manage all business accounts" ON business_accounts
  FOR ALL USING (
    auth.jwt()->>'role' = 'admin' OR
    auth.jwt()->>'user_role' = 'admin'
  );

-- Also allow public read for approved accounts (optional - for B2B catalog)
CREATE POLICY "Public can view approved accounts" ON business_accounts
  FOR SELECT USING (status = 'approved');
