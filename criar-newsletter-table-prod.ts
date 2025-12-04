import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createNewsletterTableProduction() {
  try {
    console.log('🔄 Criando tabela NewsletterSubscriber em produção...');

    // Criar tabela diretamente
    await prisma.$executeRawUnsafe(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Tabela NewsletterSubscriber criada!');

    // Testar query
    const count = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) as total FROM NewsletterSubscriber
    `);

    console.log(`✅ Total de subscribers: ${count[0]?.total || 0}`);
    console.log('✅ Tudo pronto!');
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tabela NewsletterSubscriber já existe!');
    } else {
      console.error('❌ Erro:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

createNewsletterTableProduction();
