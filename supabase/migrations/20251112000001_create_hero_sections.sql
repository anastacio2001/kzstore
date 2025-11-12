-- Migration: Hero Section Manager
-- Tabela para gerenciar o banner principal da homepage

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

-- Inserir hero section padrão atual
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
);

-- RLS Policies
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;

-- Public pode ler hero sections ativos
CREATE POLICY "Anyone can view active hero sections"
  ON hero_sections FOR SELECT
  USING (is_active = true);

-- Authenticated users podem gerenciar (admins)
CREATE POLICY "Authenticated users can manage hero sections"
  ON hero_sections FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Índices
CREATE INDEX idx_hero_sections_active ON hero_sections(is_active, display_order);
CREATE INDEX idx_hero_sections_order ON hero_sections(display_order);
