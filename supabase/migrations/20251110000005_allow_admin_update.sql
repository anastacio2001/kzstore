-- Add policy for authenticated users to update business accounts

-- Allow authenticated users to update all business accounts (for admin operations)
CREATE POLICY "Authenticated users can update accounts" ON business_accounts
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
