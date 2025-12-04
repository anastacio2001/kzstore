import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('🔧 Aplicando migration: imagem_url VARCHAR(500) → TEXT');
  
  try {
    // Executar ALTER TABLE
    await prisma.$executeRawUnsafe(`
      ALTER TABLE advertisements 
      MODIFY COLUMN imagem_url TEXT NOT NULL
    `);
    
    console.log('✅ Migration aplicada com sucesso!');
    
    // Verificar
    const result = await prisma.$queryRawUnsafe(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'advertisements' 
      AND COLUMN_NAME = 'imagem_url'
    `);
    
    console.log('📊 Estrutura da coluna:', result);
    
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
