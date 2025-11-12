-- Add permissive read policy for authenticated users (temporary for debugging)

-- Allow all authenticated users to read business accounts
CREATE POLICY "Authenticated users can view all accounts" ON business_accounts
  FOR SELECT USING (auth.role() = 'authenticated');
