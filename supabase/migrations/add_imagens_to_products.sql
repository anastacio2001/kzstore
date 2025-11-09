-- ==================================================
-- ADICIONAR CAMPO IMAGENS (ARRAY) NA TABELA PRODUCTS
-- ==================================================

-- Adicionar coluna imagens como array de URLs
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS imagens TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Adicionar comentário explicativo
COMMENT ON COLUMN products.imagens IS 'Array de URLs de imagens do produto (múltiplas fotos)';

-- Migrar imagem_url existente para o array imagens (primeira posição)
UPDATE products 
SET imagens = ARRAY[imagem_url]
WHERE imagem_url IS NOT NULL 
  AND imagem_url != '' 
  AND (imagens IS NULL OR array_length(imagens, 1) IS NULL);

-- Verificar resultado
SELECT id, nome, imagem_url, imagens FROM products LIMIT 5;

-- Nota: Manter imagem_url por compatibilidade, mas imagens é o campo principal agora
