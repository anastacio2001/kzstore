import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyNewsletterMigration() {
  try {
    console.log('🔄 Aplicando migração da tabela NewsletterSubscriber...');

    // Criar tabela NewsletterSubscriber
    await prisma.$executeRawUnsafe(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Tabela NewsletterSubscriber criada com sucesso!');

    // Verificar se a tabela existe
    const result = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) as total FROM NewsletterSubscriber
    `);

    console.log(`✅ Total de subscribers: ${result[0]?.total || 0}`);
    console.log('✅ Migração concluída com sucesso!');
  } catch (error: any) {
    console.error('❌ Erro ao aplicar migração:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyNewsletterMigration()
  .then(() => {
    console.log('✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
