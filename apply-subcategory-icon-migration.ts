/**
 * Migration: Add icon column to Subcategory table
 * Run: npx ts-node apply-subcategory-icon-migration.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Checking if icon column exists in subcategories table...');
    
    // Tentar adicionar a coluna (se já existir, vai dar erro mas é ok)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE subcategories 
      ADD COLUMN IF NOT EXISTS icon VARCHAR(200) NULL AFTER description
    `);
    
    console.log('✅ Icon column added successfully to subcategories!');
    
    // Verificar quantas subcategorias existem
    const count = await prisma.subcategory.count();
    console.log(`📊 Total subcategories in database: ${count}`);
    
  } catch (error: any) {
    if (error.code === 'P2010' || error.message.includes('Duplicate column')) {
      console.log('ℹ️ Icon column already exists - skipping');
    } else {
      console.error('❌ Error applying migration:', error);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
