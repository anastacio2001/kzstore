-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  preco_aoa NUMERIC NOT NULL,
  peso_kg NUMERIC,
  estoque INTEGER NOT NULL DEFAULT 0,
  imagem_url TEXT,
  especificacoes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desabilitar RLS para testes (já estava desabilitado)
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_categoria ON public.products(categoria);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns produtos de exemplo
INSERT INTO public.products (nome, descricao, categoria, preco_aoa, peso_kg, estoque, imagem_url, especificacoes)
VALUES
  (
    'iPhone 15 Pro Max',
    'Smartphone Apple com chip A17 Pro e câmera profissional',
    'Smartphones',
    850000,
    0.221,
    10,
    'https://images.unsplash.com/photo-1696446702071-bd0b04d0bffe?w=500',
    '{"chip": "A17 Pro", "ram": "8GB", "armazenamento": "256GB", "tela": "6.7 polegadas"}'::jsonb
  ),
  (
    'MacBook Pro 16"',
    'Notebook profissional com chip M3 Pro',
    'Notebooks',
    2500000,
    2.1,
    5,
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    '{"chip": "M3 Pro", "ram": "18GB", "armazenamento": "512GB SSD", "tela": "16 polegadas Liquid Retina XDR"}'::jsonb
  ),
  (
    'AirPods Pro (2ª geração)',
    'Fones de ouvido wireless com cancelamento de ruído',
    'Acessórios',
    85000,
    0.056,
    20,
    'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500',
    '{"cancelamento_ruido": "Ativo", "bateria": "até 6h", "chip": "H2"}'::jsonb
  ),
  (
    'Samsung Galaxy S24 Ultra',
    'Smartphone Samsung com S Pen e câmera de 200MP',
    'Smartphones',
    750000,
    0.232,
    8,
    'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
    '{"processador": "Snapdragon 8 Gen 3", "ram": "12GB", "armazenamento": "256GB", "camera": "200MP"}'::jsonb
  ),
  (
    'PlayStation 5',
    'Console de videogame Sony de última geração',
    'Gaming',
    450000,
    4.5,
    15,
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
    '{"armazenamento": "825GB SSD", "resolucao": "4K até 120fps", "ray_tracing": "Sim"}'::jsonb
  );

COMMENT ON TABLE public.products IS 'Tabela de produtos da loja';
COMMENT ON TABLE public.orders IS 'Tabela de pedidos dos clientes';
COMMENT ON TABLE public.customers IS 'Tabela de clientes cadastrados';
