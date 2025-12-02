import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  try {
    // Listar todas as tabelas
    const tables = await prisma.$queryRawUnsafe<any[]>(`
      SHOW TABLES
    `);

    console.log('📋 Tabelas no banco de dados:\n');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    // Verificar se Subcategory existe
    const subcategoryInfo = await prisma.$queryRawUnsafe<any[]>(`
      DESCRIBE Subcategory
    `).catch(() => null);

    if (subcategoryInfo) {
      console.log('\n✅ Tabela Subcategory encontrada:');
      subcategoryInfo.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });
    } else {
      console.log('\n❌ Tabela Subcategory NÃO encontrada');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
