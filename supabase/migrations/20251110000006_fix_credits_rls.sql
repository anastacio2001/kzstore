-- Fix trade_in_credits RLS to allow authenticated users to read

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own credits" ON trade_in_credits;
DROP POLICY IF EXISTS "Admins can manage all credits" ON trade_in_credits;

-- Allow any authenticated user to view all credits (for debugging)
CREATE POLICY "Authenticated users can view credits" ON trade_in_credits
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to manage credits (for admin operations)
CREATE POLICY "Authenticated users can manage credits" ON trade_in_credits
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
