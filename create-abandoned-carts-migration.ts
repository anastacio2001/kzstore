/**
 * Migration script to create abandoned_carts table
 * Run with: npx tsx create-abandoned-carts-migration.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📦 Creating abandoned_carts table...');

  try {
    // Execute raw SQL to create the table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`abandoned_carts\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`user_id\` VARCHAR(100) NULL,
        \`user_email\` VARCHAR(200) NULL,
        \`user_name\` VARCHAR(200) NULL,
        \`items\` JSON NOT NULL COMMENT 'Array de produtos no carrinho',
        \`total_aoa\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`cart_data\` JSON NULL COMMENT 'Dados adicionais do carrinho',
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'abandoned' COMMENT 'abandoned, recovered, expired',
        \`reminder_sent\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`reminder_sent_at\` DATETIME(3) NULL,
        \`recovered_at\` DATETIME(3) NULL,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        \`expires_at\` DATETIME(3) NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_user_email\` (\`user_email\`),
        INDEX \`idx_status\` (\`status\`),
        INDEX \`idx_created_at\` (\`created_at\`),
        INDEX \`idx_reminder_sent\` (\`reminder_sent\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Table created successfully!');

    // Verify table exists
    const result = await prisma.$queryRawUnsafe<any[]>(`
      SHOW TABLES LIKE 'abandoned_carts'
    `);

    if (result.length > 0) {
      console.log('✅ Verification: Table exists');

      // Show table structure
      const structure = await prisma.$queryRawUnsafe<any[]>(`
        DESCRIBE abandoned_carts
      `);

      console.log('\n📋 Table structure:');
      console.table(structure);
    } else {
      console.log('❌ Warning: Table not found after creation');
    }

  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
