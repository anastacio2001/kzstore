#!/usr/bin/env node
/**
 * Script para migrar dados do MySQL para PostgreSQL
 * Exporta dados do MySQL via Prisma e importa no Neon
 */

const { PrismaClient } = require('@prisma/client');

// Configurar Prisma para MySQL (backup)
const mysqlPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://kzstore_app:Kzstore2024!@127.0.0.1:3307/kzstore_prod'
    }
  }
});

// Configurar Prisma para PostgreSQL (Neon)
const postgresPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_SQ7slkhE8HrG@ep-patient-bonus-aghbwx76-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

async function migrateData() {
  console.log('🚀 Iniciando migração de dados MySQL → PostgreSQL...\n');

  try {
    // Tabelas a migrar (em ordem para respeitar foreign keys)
    const tables = [
      'users',
      'teamMembers',
      'products',
      'orders',
      'orderItems',
      'coupons',
      'flashSales',
      'customers',
      'ads',
      'reviews',
      'tickets',
      'preOrders',
      'tradeIns',
      'quotes',
      'affiliates',
      'newsletter',
      'whatsappMessages',
      'cronJobs',
      'heroSettings',
      'categories',
      'subcategories',
      'footerSettings',
      'blogPosts',
      'blogComments',
      'blogShares',
      'blogSearches',
      'blogNewsletterPopups',
      'blogPostRelated',
      'blogPostTags'
    ];

    for (const table of tables) {
      try {
        console.log(`📦 Migrando tabela: ${table}...`);
        
        // Exportar dados do MySQL
        const data = await mysqlPrisma[table].findMany();
        
        if (data.length === 0) {
          console.log(`   ⏭️  Vazia, pulando...`);
          continue;
        }

        console.log(`   📊 ${data.length} registros encontrados`);

        // Importar para PostgreSQL
        for (const record of data) {
          await postgresPrisma[table].create({
            data: record
          });
        }

        console.log(`   ✅ ${data.length} registros migrados\n`);
      } catch (error) {
        console.error(`   ❌ Erro na tabela ${table}:`, error.message);
        console.log(`   ⏭️  Continuando...\n`);
      }
    }

    console.log('\n🎉 Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await mysqlPrisma.$disconnect();
    await postgresPrisma.$disconnect();
  }
}

migrateData();
