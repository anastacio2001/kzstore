#!/bin/bash

# Script para aplicar migração do Newsletter em produção
# Executar após o deploy

echo "🔄 Aplicando migração da tabela NewsletterSubscriber em produção..."

# Conectar ao Cloud SQL e executar SQL
gcloud sql connect kzstore-01 --user=root --quiet << EOF
USE kzstore;

CREATE TABLE IF NOT EXISTS NewsletterSubscriber (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(200),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  source VARCHAR(100),
  subscribed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  unsubscribed_at DATETIME(3),
  
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_subscribed_at (subscribed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabela criada com sucesso!' as status;
SELECT COUNT(*) as total_subscribers FROM NewsletterSubscriber;

EOF

echo "✅ Migração concluída!"
