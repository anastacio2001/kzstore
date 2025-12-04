#!/bin/bash

# Script para criar tabela NewsletterSubscriber usando MySQL client

echo "🔄 Conectando ao Cloud SQL e criando tabela NewsletterSubscriber..."

# Obter senha do Secret Manager
echo "🔑 Obtendo credenciais..."

# Conectar diretamente via gcloud e executar SQL
gcloud sql connect kzstore-01 --user=root << 'EOF'
USE kzstore_prod;

CREATE TABLE IF NOT EXISTS NewsletterSubscriber (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(200) DEFAULT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  source VARCHAR(100) DEFAULT NULL,
  subscribed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  unsubscribed_at DATETIME(3) DEFAULT NULL,
  KEY idx_email (email),
  KEY idx_status (status),
  KEY idx_subscribed_at (subscribed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabela NewsletterSubscriber criada com sucesso!' as status;
SELECT COUNT(*) as total_subscribers FROM NewsletterSubscriber;
EOF

echo "✅ Tabela criada com sucesso!"
