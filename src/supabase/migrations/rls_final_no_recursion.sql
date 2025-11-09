-- SOLUÇÃO FINAL - SEM RECURSÃO
-- Desabilita RLS na tabela admin_users para evitar recursão

-- 1. Dropar tudo primeiro
DROP POLICY IF EXISTS "admins_can_view_admin_list" ON admin_users;
DROP POLICY IF EXISTS "admins_can_add_admins" ON admin_users;
DROP POLICY IF EXISTS "users_can_view_own_tickets" ON tickets;
DROP POLICY IF EXISTS "users_can_create_tickets" ON tickets;
DROP POLICY IF EXISTS "users_can_rate_own_tickets" ON tickets;
DROP POLICY IF EXISTS "admins_can_view_all_tickets" ON tickets;
DROP POLICY IF EXISTS "admins_can_update_all_tickets" ON tickets;
DROP POLICY IF EXISTS "users_and_admins_view_tickets" ON tickets;
DROP POLICY IF EXISTS "users_and_admins_update_tickets" ON tickets;
DROP POLICY IF EXISTS "view_tickets" ON tickets;
DROP POLICY IF EXISTS "create_tickets" ON tickets;
DROP POLICY IF EXISTS "update_tickets" ON tickets;

DROP POLICY IF EXISTS "users_can_view_own_ticket_messages" ON ticket_messages;
DROP POLICY IF EXISTS "users_can_create_messages_own_tickets" ON ticket_messages;
DROP POLICY IF EXISTS "admins_can_view_all_messages" ON ticket_messages;
DROP POLICY IF EXISTS "admins_can_create_all_messages" ON ticket_messages;
DROP POLICY IF EXISTS "users_and_admins_view_messages" ON ticket_messages;
DROP POLICY IF EXISTS "users_and_admins_create_messages" ON ticket_messages;
DROP POLICY IF EXISTS "view_messages" ON ticket_messages;
DROP POLICY IF EXISTS "create_messages" ON ticket_messages;

-- 2. Criar tabela admin_users se não existir
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. Inserir admins
INSERT INTO public.admin_users (user_id, email)
SELECT id, email FROM auth.users WHERE email = 'leuboy30@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.admin_users (user_id, email)
SELECT id, email FROM auth.users WHERE email = 'admin@kzstore.ao'
ON CONFLICT (user_id) DO NOTHING;

-- 4. DESABILITAR RLS em admin_users (evita recursão)
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- 5. Dar permissão de leitura para authenticated
GRANT SELECT ON public.admin_users TO authenticated;

-- 6. Habilitar RLS apenas em tickets e ticket_messages
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- 7. Políticas FINAIS para TICKETS

CREATE POLICY "view_tickets"
ON tickets FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

CREATE POLICY "create_tickets"
ON tickets FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_tickets"
ON tickets FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

-- 8. Políticas FINAIS para TICKET_MESSAGES

CREATE POLICY "view_messages"
ON ticket_messages FOR SELECT
TO authenticated
USING (
  ticket_id IN (
    SELECT id FROM tickets 
    WHERE user_id = auth.uid()
  )
  OR
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

CREATE POLICY "create_messages"
ON ticket_messages FOR INSERT
TO authenticated
WITH CHECK (
  ticket_id IN (
    SELECT id FROM tickets 
    WHERE user_id = auth.uid()
  )
  OR
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

-- 9. Garantir permissões
GRANT SELECT, INSERT, UPDATE ON tickets TO authenticated;
GRANT SELECT, INSERT ON ticket_messages TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 10. Índices
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

-- 11. Comentários
COMMENT ON TABLE public.admin_users IS 'Lista de admins - SEM RLS para evitar recursão';
COMMENT ON POLICY "view_tickets" ON tickets IS 'Users veem seus tickets, admins veem todos';
COMMENT ON POLICY "view_messages" ON ticket_messages IS 'Users veem mensagens dos seus tickets, admins veem todas';
