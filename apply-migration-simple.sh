#!/bin/bash

# Script simplificado para aplicar migração via gcloud
echo "🚀 Aplicando migração do Blog ao Cloud SQL..."
echo "================================================"
echo ""

# Whitelist IP
echo "📡 Habilitando acesso ao Cloud SQL..."
gcloud sql connect kzstore-01 --user=root <<EOF
USE kzstore_prod;

-- 1. Criar tabela blog_comments
CREATE TABLE IF NOT EXISTS blog_comments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  post_id VARCHAR(36) NOT NULL,
  parent_id VARCHAR(36) NULL,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  author_avatar VARCHAR(500) NULL,
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'spam') DEFAULT 'pending',
  likes_count INT DEFAULT 0,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES blog_comments(id) ON DELETE CASCADE,
  INDEX idx_post_status (post_id, status),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Criar tabela blog_analytics
CREATE TABLE IF NOT EXISTS blog_analytics (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  post_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(100) NULL,
  user_id VARCHAR(36) NULL,
  time_spent INT DEFAULT 0,
  scroll_depth INT DEFAULT 0,
  completed_read BOOLEAN DEFAULT FALSE,
  device VARCHAR(50) NULL,
  referrer VARCHAR(500) NULL,
  utm_source VARCHAR(100) NULL,
  utm_medium VARCHAR(100) NULL,
  utm_campaign VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  INDEX idx_post (post_id),
  INDEX idx_session (session_id),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Criar tabela blog_shares
CREATE TABLE IF NOT EXISTS blog_shares (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  post_id VARCHAR(36) NOT NULL,
  platform ENUM('whatsapp', 'facebook', 'twitter', 'linkedin', 'email', 'copy', 'native') NOT NULL,
  session_id VARCHAR(100) NULL,
  user_id VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  INDEX idx_post_platform (post_id, platform),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Criar tabela blog_likes
CREATE TABLE IF NOT EXISTS blog_likes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  post_id VARCHAR(36) NULL,
  comment_id VARCHAR(36) NULL,
  session_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES blog_comments(id) ON DELETE CASCADE,
  UNIQUE KEY unique_post_like (post_id, session_id),
  UNIQUE KEY unique_comment_like (comment_id, session_id),
  INDEX idx_post (post_id),
  INDEX idx_comment (comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Criar tabela blog_searches
CREATE TABLE IF NOT EXISTS blog_searches (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  search_query VARCHAR(255) NOT NULL,
  results_count INT DEFAULT 0,
  clicked_post_id VARCHAR(36) NULL,
  session_id VARCHAR(100) NULL,
  filters JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clicked_post_id) REFERENCES blog_posts(id) ON DELETE SET NULL,
  INDEX idx_query (search_query),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Criar tabela blog_newsletter_popups
CREATE TABLE IF NOT EXISTS blog_newsletter_popups (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  post_id VARCHAR(36) NOT NULL,
  action ENUM('shown', 'subscribed', 'dismissed', 'closed') NOT NULL,
  session_id VARCHAR(100) NULL,
  email VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  INDEX idx_post_action (post_id, action),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Adicionar campos em blog_posts (se não existirem)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS shares_count INT DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS avg_time_spent INT DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS reading_time INT DEFAULT 5;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN DEFAULT TRUE;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_products JSON NULL;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cta_text VARCHAR(100) NULL;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cta_link VARCHAR(500) NULL;

-- Verificar tabelas criadas
SHOW TABLES LIKE 'blog_%';

SELECT '✅ Migração concluída com sucesso!' as status;
EOF

echo ""
echo "✅ Migração aplicada!"
echo ""
echo "📊 Próximos passos:"
echo "1. Acesse: https://kzstore-341392738431.europe-southwest1.run.app/admin"
echo "2. Navegue para: Blog Analytics"
echo "3. Teste as 4 abas: Comentários, Analytics, Compartilhamentos, Newsletter"
