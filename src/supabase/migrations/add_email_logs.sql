-- Tabela para registrar logs de emails enviados
CREATE TABLE IF NOT EXISTS ticket_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('new_ticket', 'admin_response')),
  recipient TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  resend_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para buscar logs por ticket
CREATE INDEX IF NOT EXISTS idx_ticket_email_logs_ticket_id ON ticket_email_logs(ticket_id);

-- Desabilitar RLS para testes
ALTER TABLE ticket_email_logs DISABLE ROW LEVEL SECURITY;
GRANT ALL ON ticket_email_logs TO authenticated;
GRANT ALL ON ticket_email_logs TO anon;

-- Comentários
COMMENT ON TABLE ticket_email_logs IS 'Registro de todos os emails enviados pelo sistema de tickets';
COMMENT ON COLUMN ticket_email_logs.email_type IS 'Tipo: new_ticket (para admins) ou admin_response (para usuário)';
COMMENT ON COLUMN ticket_email_logs.resend_id IS 'ID retornado pela API do Resend.com';
