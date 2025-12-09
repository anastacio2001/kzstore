/**
 * Script para aplicar migração do blog via Prisma
 * Executa via servidor em produção
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyMigration() {
  console.log('🚀 Aplicando migração do blog...\n');

  try {
    // 1. Criar tabela blog_comments
    console.log('📝 Criando tabela blog_comments...');
    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✅ Tabela blog_comments criada\n');

    // 2. Criar tabela blog_analytics
    console.log('📊 Criando tabela blog_analytics...');
    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✅ Tabela blog_analytics criada\n');

    // 3. Criar tabela blog_shares
    console.log('📤 Criando tabela blog_shares...');
    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✅ Tabela blog_shares criada\n');

    // 4. Criar tabela blog_likes
    console.log('❤️ Criando tabela blog_likes...');
    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✅ Tabela blog_likes criada\n');

    // 5. Criar tabela blog_searches
    console.log('🔍 Criando tabela blog_searches...');
    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✅ Tabela blog_searches criada\n');

    // 6. Criar tabela blog_newsletter_popups
    console.log('📧 Criando tabela blog_newsletter_popups...');
    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✅ Tabela blog_newsletter_popups criada\n');

    // 7. Adicionar campos em blog_posts
    console.log('📝 Adicionando campos em blog_posts...');
    
    const fieldsToAdd = [
      { name: 'comments_count', type: 'INT DEFAULT 0' },
      { name: 'shares_count', type: 'INT DEFAULT 0' },
      { name: 'avg_time_spent', type: 'INT DEFAULT 0' },
      { name: 'completion_rate', type: 'DECIMAL(5,2) DEFAULT 0.00' },
      { name: 'reading_time', type: 'INT DEFAULT 5' },
      { name: 'allow_comments', type: 'BOOLEAN DEFAULT TRUE' },
      { name: 'related_products', type: 'JSON NULL' },
      { name: 'cta_text', type: 'VARCHAR(100) NULL' },
      { name: 'cta_link', type: 'VARCHAR(500) NULL' }
    ];

    for (const field of fieldsToAdd) {
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE blog_posts ADD COLUMN ${field.name} ${field.type}
        `);
        console.log(`  ✅ Campo ${field.name} adicionado`);
      } catch (error: any) {
        if (error.message.includes('Duplicate column')) {
          console.log(`  ⏭️ Campo ${field.name} já existe`);
        } else {
          throw error;
        }
      }
    }
    console.log('✅ Campos adicionados em blog_posts\n');

    console.log('🎉 Migração concluída com sucesso!');
    console.log('\n✨ Próximos passos:');
    console.log('1. Acesse o painel admin em /admin');
    console.log('2. Navegue para "Blog Analytics"');
    console.log('3. Teste as 4 sub-abas: Comentários, Analytics, Compartilhamentos, Newsletter Popup');
    
  } catch (error) {
    console.error('❌ Erro ao aplicar migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration()
  .then(() => {
    console.log('\n✅ Processo finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Falha na migração:', error);
    process.exit(1);
  });
