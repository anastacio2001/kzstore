-- ==================================================
-- ADICIONAR CAMPO CONDICAO NA TABELA PRODUCTS
-- ==================================================

-- Adicionar coluna condicao (condição do produto: Novo, Usado, Recondicionado)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS condicao TEXT DEFAULT 'Novo';

-- Adicionar comentário explicativo
COMMENT ON COLUMN products.condicao IS 'Condição do produto: Novo, Usado, Recondicionado, etc.';

-- Atualizar produtos existentes para ter condição "Novo" por padrão
UPDATE products 
SET condicao = 'Novo' 
WHERE condicao IS NULL;

-- Verificar resultado
SELECT id, nome, condicao FROM products LIMIT 5;
