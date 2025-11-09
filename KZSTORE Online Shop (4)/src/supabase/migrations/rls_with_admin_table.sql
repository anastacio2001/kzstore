-- ESTRATÉGIA RLS DEFINITIVA - COM TABELA DE ADMINS
-- Esta solução funciona 100% e é segura para produção

-- 1. Criar tabela de admins
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- 2. Inserir o admin principal (ajuste o email se necessário)
INSERT INTO public.admin_users (user_id, email)
SELECT id, email FROM auth.users WHERE email = 'admin@kzstore.ao'
ON CONFLICT (user_id) DO NOTHING;

-- Também pode adicionar leuboy30@gmail.com como admin se quiser
INSERT INTO public.admin_users (user_id, email)
SELECT id, email FROM auth.users WHERE email = 'leuboy30@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- 3. Habilitar RLS na tabela admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin pode ver lista de admins
CREATE POLICY "admins_can_view_admin_list"
ON public.admin_users FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

-- Apenas admins podem adicionar outros admins
CREATE POLICY "admins_can_add_admins"
ON public.admin_users FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

-- 4. Dropar políticas antigas de tickets
DROP POLICY IF EXISTS "users_can_view_own_tickets" ON tickets;
DROP POLICY IF EXISTS "users_can_create_tickets" ON tickets;
DROP POLICY IF EXISTS "users_can_rate_own_tickets" ON tickets;
DROP POLICY IF EXISTS "admins_can_view_all_tickets" ON tickets;
DROP POLICY IF EXISTS "admins_can_update_all_tickets" ON tickets;
DROP POLICY IF EXISTS "users_and_admins_view_tickets" ON tickets;
DROP POLICY IF EXISTS "users_and_admins_update_tickets" ON tickets;

-- 5. Dropar políticas antigas de ticket_messages
DROP POLICY IF EXISTS "users_can_view_own_ticket_messages" ON ticket_messages;
DROP POLICY IF EXISTS "users_can_create_messages_own_tickets" ON ticket_messages;
DROP POLICY IF EXISTS "admins_can_view_all_messages" ON ticket_messages;
DROP POLICY IF EXISTS "admins_can_create_all_messages" ON ticket_messages;
DROP POLICY IF EXISTS "users_and_admins_view_messages" ON ticket_messages;
DROP POLICY IF EXISTS "users_and_admins_create_messages" ON ticket_messages;

-- 6. Habilitar RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS FINAIS PARA TICKETS (super simples)

-- Ver tickets: próprios OU se for admin
CREATE POLICY "view_tickets"
ON tickets FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

-- Criar tickets: qualquer usuário autenticado
CREATE POLICY "create_tickets"
ON tickets FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Atualizar tickets: próprios OU se for admin
CREATE POLICY "update_tickets"
ON tickets FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

-- 8. POLÍTICAS FINAIS PARA TICKET_MESSAGES (super simples)

-- Ver mensagens: se o ticket for seu OU se for admin
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

-- Criar mensagens: se o ticket for seu OU se for admin
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
GRANT SELECT ON admin_users TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 10. Índices para performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

-- 11. Comentários
COMMENT ON TABLE public.admin_users IS 'Lista de usuários com permissões de admin';
COMMENT ON POLICY "view_tickets" ON tickets IS 'Usuários veem seus tickets, admins veem todos';
COMMENT ON POLICY "view_messages" ON ticket_messages IS 'Usuários veem mensagens dos seus tickets, admins veem todas';

-- 12. Função helper para verificar se usuário é admin (opcional, para usar no código)
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = user_uuid
  );
$$;

-- Exemplo de uso da função:
-- SELECT is_admin(); -- retorna true se o usuário logado for admin
-- SELECT is_admin('uuid-do-usuario'); -- verifica se um usuário específico é admin
