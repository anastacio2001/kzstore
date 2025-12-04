#!/bin/bash

# Usar MySQL 8.0 compatível
export PATH="/opt/homebrew/opt/mysql-client@8.0/bin:$PATH"

echo "🔧 Conectando ao Cloud SQL..."
echo "📝 Você precisará inserir a senha quando solicitado"
echo ""

# Conectar e executar migration
gcloud sql connect kzstore-01 --user=root << 'EOF'
USE kzstore_prod;

-- Migration: Alterar imagem_url para TEXT
ALTER TABLE advertisements MODIFY COLUMN imagem_url TEXT NOT NULL;

-- Verificar alteração
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'advertisements' AND COLUMN_NAME = 'imagem_url';

-- Mostrar estrutura
DESCRIBE advertisements;

exit
EOF

echo ""
echo "✅ Migration concluída!"
