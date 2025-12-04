import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixImageUrlColumn() {
  try {
    console.log('🔧 Alterando coluna imagem_url_v2 para MEDIUMTEXT (16MB)...');

    // Alterar para MEDIUMTEXT (suporta até 16MB = 16.777.215 caracteres)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE advertisements
      MODIFY COLUMN imagem_url_v2 MEDIUMTEXT NOT NULL
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
      ORDER BY url_length DESC
    `);
    console.log('📏 Tamanhos das URLs (ordenado):', urlLengths);

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
