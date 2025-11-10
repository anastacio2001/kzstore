-- ============================================================================
-- FIX TRADE-IN RLS POLICIES
-- Remove dependência da tabela auth.users que causa erro de permissão
-- ============================================================================

-- Drop políticas antigas
DROP POLICY IF EXISTS "Users can view own trade-in requests" ON trade_in_requests;
DROP POLICY IF EXISTS "Users can create trade-in requests" ON trade_in_requests;
DROP POLICY IF EXISTS "Admins can view all trade-in requests" ON trade_in_requests;
DROP POLICY IF EXISTS "Admins can manage evaluations" ON trade_in_evaluations;
DROP POLICY IF EXISTS "Users can view own credits" ON trade_in_credits;
DROP POLICY IF EXISTS "Admins can manage all credits" ON trade_in_credits;

-- Políticas corrigidas para trade_in_requests
CREATE POLICY "Users can view own trade-in requests" ON trade_in_requests
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND customer_email = auth.jwt()->>'email'
  );

CREATE POLICY "Users can create trade-in requests" ON trade_in_requests
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND customer_email = auth.jwt()->>'email'
  );

CREATE POLICY "Admins can view all trade-in requests" ON trade_in_requests
  FOR ALL USING (
    auth.uid() IS NOT NULL 
    AND (
      auth.jwt()->>'email' IN (
        SELECT email FROM admin_users
      )
      OR auth.jwt()->>'role' = 'admin'
    )
  );

-- Políticas corrigidas para trade_in_evaluations (apenas admin)
CREATE POLICY "Admins can manage evaluations" ON trade_in_evaluations
  FOR ALL USING (
    auth.uid() IS NOT NULL 
    AND (
      auth.jwt()->>'email' IN (
        SELECT email FROM admin_users
      )
      OR auth.jwt()->>'role' = 'admin'
    )
  );

-- Políticas corrigidas para trade_in_credits
CREATE POLICY "Users can view own credits" ON trade_in_credits
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND customer_email = auth.jwt()->>'email'
  );

CREATE POLICY "Admins can manage all credits" ON trade_in_credits
  FOR ALL USING (
    auth.uid() IS NOT NULL 
    AND (
      auth.jwt()->>'email' IN (
        SELECT email FROM admin_users
      )
      OR auth.jwt()->>'role' = 'admin'
    )
  );

-- Garantir que admin_users existe
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Remover constraint de foreign key se existir (para permitir inserção sem user em auth.users)
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_user_id_fkey;

-- Inserir seu email como admin se ainda não existir
INSERT INTO admin_users (user_id, email)
SELECT 
  gen_random_uuid(),
  'kzstoregeral@gmail.com'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE email = 'kzstoregeral@gmail.com'
);
