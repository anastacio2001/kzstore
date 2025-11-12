-- ====================================================================
-- SCRIPT DE ATUALIZAÇÃO - Gerenciamento de Hero Section e Categorias
-- Execute este script no SQL Editor do Supabase Dashboard
-- Data: 12 de Novembro de 2025
-- ====================================================================

-- ============================================
-- PARTE 1: HERO SECTIONS (Banner Principal)
-- ============================================

-- Criar tabela hero_sections
CREATE TABLE IF NOT EXISTS hero_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  cta_primary_text TEXT DEFAULT 'Ver Produtos',
  cta_primary_link TEXT DEFAULT '/produtos',
  cta_secondary_text TEXT DEFAULT 'Falar com Especialista',
  cta_secondary_link TEXT DEFAULT '/contato',
  badge_text TEXT DEFAULT 'Novidade: Novos produtos a cada semana',
  stats_label TEXT DEFAULT 'Vendas em 2024',
  stats_value TEXT DEFAULT '10k+',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir hero section padrão (dados atuais do site)
INSERT INTO hero_sections (
  title,
  subtitle,
  description,
  image_url,
  cta_primary_text,
  cta_secondary_text,
  badge_text,
  stats_label,
  stats_value,
  is_active,
  display_order
) VALUES (
  'Tecnologia de',
  'Ponta em Angola',
  'A maior loja online de produtos eletrônicos especializados. RAM para servidores, SSD, Mini PCs e muito mais com os melhores preços.',
  '/hero-tech-image.jpg',
  'Ver Produtos',
  'Falar com Especialista',
  'Novidade: Novos produtos a cada semana',
  'Vendas em 2024',
  '10k+',
  true,
  1
)
ON CONFLICT DO NOTHING;

-- RLS Policies para hero_sections
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active hero sections" ON hero_sections;
CREATE POLICY "Anyone can view active hero sections"
  ON hero_sections FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage hero sections" ON hero_sections;
CREATE POLICY "Authenticated users can manage hero sections"
  ON hero_sections FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_hero_sections_active ON hero_sections(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_hero_sections_order ON hero_sections(display_order);

-- ============================================
-- PARTE 2: CATEGORIAS E SUBCATEGORIAS
-- ============================================

-- Criar tabela categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  color TEXT DEFAULT '#3b82f6',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  show_in_menu BOOLEAN DEFAULT true,
  show_in_homepage BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela subcategories
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- Inserir categorias padrão
INSERT INTO categories (name, slug, description, icon, display_order, show_in_menu, show_in_homepage) VALUES
  ('Computadores', 'computadores', 'Desktops, All-in-One e Workstations', 'Monitor', 1, true, true),
  ('Laptops', 'laptops', 'Notebooks e Ultrabooks', 'Laptop', 2, true, true),
  ('Componentes', 'componentes', 'Hardware e Peças', 'Cpu', 3, true, true),
  ('Periféricos', 'perifericos', 'Teclados, Mouses e Acessórios', 'Keyboard', 4, true, true),
  ('Armazenamento', 'armazenamento', 'SSDs, HDDs e Pendrives', 'HardDrive', 5, true, true),
  ('Redes', 'redes', 'Roteadores, Switches e Cabos', 'Wifi', 6, true, true),
  ('Servidores', 'servidores', 'Servidores e Equipamentos Data Center', 'Server', 7, true, true),
  ('Smartphones', 'smartphones', 'Celulares e Tablets', 'Smartphone', 8, true, true)
ON CONFLICT (name) DO NOTHING;

-- Inserir subcategorias padrão
INSERT INTO subcategories (category_id, name, slug, description, display_order) 
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.description,
  sub.display_order
FROM categories c
CROSS JOIN (
  VALUES 
    ('Computadores', 'Desktop Gaming', 'desktop-gaming', 'PCs para jogos de alto desempenho', 1),
    ('Computadores', 'Workstations', 'workstations', 'Estações de trabalho profissionais', 2),
    ('Computadores', 'All-in-One', 'all-in-one', 'Computadores integrados', 3),
    ('Laptops', 'Gaming', 'gaming-laptops', 'Notebooks para jogos', 1),
    ('Laptops', 'Ultrabooks', 'ultrabooks', 'Notebooks finos e leves', 2),
    ('Laptops', 'Business', 'business-laptops', 'Notebooks corporativos', 3),
    ('Componentes', 'Processadores', 'processadores', 'CPUs Intel e AMD', 1),
    ('Componentes', 'Placas-Mãe', 'placas-mae', 'Motherboards', 2),
    ('Componentes', 'Memória RAM', 'memoria-ram', 'RAM DDR4 e DDR5', 3),
    ('Componentes', 'Placas de Vídeo', 'placas-video', 'GPUs NVIDIA e AMD', 4),
    ('Periféricos', 'Teclados', 'teclados', 'Teclados mecânicos e de membrana', 1),
    ('Periféricos', 'Mouses', 'mouses', 'Mouses gamer e profissionais', 2),
    ('Periféricos', 'Monitores', 'monitores', 'Monitores e Displays', 3),
    ('Armazenamento', 'SSDs', 'ssds', 'Discos SSD NVMe e SATA', 1),
    ('Armazenamento', 'HDDs', 'hdds', 'Discos rígidos', 2),
    ('Armazenamento', 'Externos', 'externos', 'Armazenamento externo', 3)
) AS sub(category_name, name, slug, description, display_order)
WHERE c.name = sub.category_name
ON CONFLICT (category_id, slug) DO NOTHING;

-- Adicionar colunas category_id e subcategory_id na tabela products (se não existirem)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id);

-- RLS Policies para categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies para subcategories
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active subcategories" ON subcategories;
CREATE POLICY "Anyone can view active subcategories"
  ON subcategories FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage subcategories" ON subcategories;
CREATE POLICY "Authenticated users can manage subcategories"
  ON subcategories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_menu ON categories(show_in_menu, display_order);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id, display_order);
CREATE INDEX IF NOT EXISTS idx_subcategories_active ON subcategories(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);

-- ============================================
-- PARTE 3: TRIGGERS PARA UPDATED_AT
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para hero_sections
DROP TRIGGER IF EXISTS update_hero_sections_updated_at ON hero_sections;
CREATE TRIGGER update_hero_sections_updated_at
  BEFORE UPDATE ON hero_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para subcategories
DROP TRIGGER IF EXISTS update_subcategories_updated_at ON subcategories;
CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- FIM DO SCRIPT
-- ====================================================================

-- Para verificar se deu tudo certo, execute:
-- SELECT * FROM hero_sections;
-- SELECT * FROM categories ORDER BY display_order;
-- SELECT COUNT(*) FROM subcategories;
