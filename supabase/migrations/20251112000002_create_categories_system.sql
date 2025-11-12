-- Migration: Categories and Subcategories Manager
-- Sistema completo de gerenciamento de categorias

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Nome do ícone Lucide
  image_url TEXT,
  color TEXT DEFAULT '#3b82f6', -- Cor hex para UI
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  show_in_menu BOOLEAN DEFAULT true,
  show_in_homepage BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Inserir categorias padrão atuais
INSERT INTO categories (name, slug, description, icon, display_order, show_in_menu, show_in_homepage) VALUES
  ('Computadores', 'computadores', 'Desktops, All-in-One e Workstations', 'Monitor', 1, true, true),
  ('Laptops', 'laptops', 'Notebooks e Ultrabooks', 'Laptop', 2, true, true),
  ('Componentes', 'componentes', 'Hardware e Peças', 'Cpu', 3, true, true),
  ('Periféricos', 'perifericos', 'Teclados, Mouses e Acessórios', 'Keyboard', 4, true, true),
  ('Armazenamento', 'armazenamento', 'SSDs, HDDs e Pendrives', 'HardDrive', 5, true, true),
  ('Redes', 'redes', 'Roteadores, Switches e Cabos', 'Wifi', 6, true, true),
  ('Servidores', 'servidores', 'Servidores e Equipamentos Data Center', 'Server', 7, true, true),
  ('Smartphones', 'smartphones', 'Celulares e Tablets', 'Smartphone', 8, true, true);

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
WHERE c.name = sub.category_name;

-- Adicionar coluna category_id na tabela products (se não existir)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id);

-- RLS Policies para categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies para subcategories
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subcategories"
  ON subcategories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage subcategories"
  ON subcategories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Índices para performance
CREATE INDEX idx_categories_active ON categories(is_active, display_order);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_menu ON categories(show_in_menu, display_order);
CREATE INDEX idx_subcategories_category ON subcategories(category_id, display_order);
CREATE INDEX idx_subcategories_active ON subcategories(is_active);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
