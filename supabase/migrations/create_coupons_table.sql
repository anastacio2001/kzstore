-- ====================================================================
-- SISTEMA DE CUPONS DE DESCONTO
-- Execute no SQL Editor do Supabase
-- ====================================================================

-- Criar tabela de cupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  min_purchase DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER DEFAULT NULL, -- NULL = ilimitado
  used_count INTEGER DEFAULT 0,
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP DEFAULT NULL, -- NULL = sem expiração
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(start_date, end_date);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_coupons_updated_at ON coupons;
CREATE TRIGGER trigger_update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_updated_at();

-- Adicionar coluna de cupom na tabela de pedidos
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- Desabilitar RLS para permitir uso público (ajustar conforme segurança)
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;

-- Inserir cupons de exemplo
INSERT INTO coupons (code, discount_type, discount_value, min_purchase, description) VALUES
  ('BEMVINDO10', 'percentage', 10, 0, 'Desconto de 10% para novos clientes'),
  ('KZSTORE50', 'fixed', 50, 500, 'Kz 50 de desconto em compras acima de Kz 500'),
  ('FRETEGRATIS', 'fixed', 100, 1000, 'Frete grátis em compras acima de Kz 1000')
ON CONFLICT (code) DO NOTHING;

-- ====================================================================
-- PRONTO! Sistema de cupons criado com sucesso
-- ====================================================================
