#!/bin/bash

# Script para criar tabela via Cloud SQL Admin API

echo "📦 Criando tabela abandoned_carts via API..."

# Ler o SQL do arquivo
SQL_STATEMENT=$(cat create-abandoned-carts-table.sql)

# Criar arquivo temporário com o SQL
cat > /tmp/create-table.sql <<'EOSQL'
USE kzstore_prod;

CREATE TABLE IF NOT EXISTS `abandoned_carts` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(100) NULL,
  `user_email` VARCHAR(200) NULL,
  `user_name` VARCHAR(200) NULL,
  `items` JSON NOT NULL COMMENT 'Array de produtos no carrinho',
  `total_aoa` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `cart_data` JSON NULL COMMENT 'Dados adicionais do carrinho',
  `status` VARCHAR(50) NOT NULL DEFAULT 'abandoned' COMMENT 'abandoned, recovered, expired',
  `reminder_sent` BOOLEAN NOT NULL DEFAULT FALSE,
  `reminder_sent_at` DATETIME(3) NULL,
  `recovered_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `expires_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_user_email` (`user_email`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_reminder_sent` (`reminder_sent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SHOW TABLES LIKE 'abandoned_carts';
EOSQL

# Executar via gcloud sql execute
gcloud sql operations list \
  --instance=kzstore-01 \
  --project=kzstore-477422 \
  --limit=1

echo "Tentando executar SQL via Cloud SQL..."
cat /tmp/create-table.sql | gcloud sql connect kzstore-01 --user=root --project=kzstore-477422

rm /tmp/create-table.sql
echo "✅ Concluído!"
