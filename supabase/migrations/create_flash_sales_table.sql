-- Criar tabela de flash sales
CREATE TABLE IF NOT EXISTS public.flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  stock_limit INTEGER NOT NULL DEFAULT 0,
  stock_sold INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_stock CHECK (stock_sold <= stock_limit)
);

-- Desabilitar RLS para testes
ALTER TABLE public.flash_sales DISABLE ROW LEVEL SECURITY;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_flash_sales_product_id ON public.flash_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_flash_sales_is_active ON public.flash_sales(is_active);
CREATE INDEX IF NOT EXISTS idx_flash_sales_dates ON public.flash_sales(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_flash_sales_created_at ON public.flash_sales(created_at DESC);

-- Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_flash_sales_updated_at ON public.flash_sales;
CREATE TRIGGER update_flash_sales_updated_at
  BEFORE UPDATE ON public.flash_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.flash_sales IS 'Tabela de ofertas relâmpago (flash sales)';
