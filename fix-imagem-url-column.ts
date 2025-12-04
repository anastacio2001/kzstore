import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixImageUrlColumn() {
  try {
    console.log('🔧 Verificando tipo atual da coluna imagem_url_v2...');

    // Verificar tipo atual
    const currentType = await prisma.$queryRawUnsafe(`
      SHOW COLUMNS FROM advertisements LIKE 'imagem_url_v2'
    `);
    console.log('📊 Tipo atual:', currentType);

    console.log('🔨 Alterando coluna imagem_url_v2 para TEXT...');

    // Alterar para TEXT
    await prisma.$executeRawUnsafe(`
      ALTER TABLE advertisements
      MODIFY COLUMN imagem_url_v2 TEXT NOT NULL
    `);

    console.log('✅ Coluna alterada com sucesso!');

    // Verificar novo tipo
    const newType = await prisma.$queryRawUnsafe(`
      SHOW COLUMNS FROM advertisements LIKE 'imagem_url_v2'
    `);
    console.log('📊 Novo tipo:', newType);

    // Verificar tamanho das URLs existentes
    const urlLengths = await prisma.$queryRawUnsafe(`
      SELECT id, titulo, LENGTH(imagem_url_v2) as url_length
      FROM advertisements
    `);
    console.log('📏 Tamanhos das URLs:', urlLengths);

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixImageUrlColumn()
  .then(() => {
    console.log('✅ Migração concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migração falhou:', error);
    process.exit(1);
  });
