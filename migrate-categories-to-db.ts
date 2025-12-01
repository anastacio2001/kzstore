/**
 * Script para migrar categorias do localStorage para o banco de dados
 * Execute: npx tsx migrate-categories-to-db.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Categorias padrão (baseadas no que está no localStorage)
const defaultCategories = [
  {
    id: 'ram',
    name: 'Memória RAM',
    icon: '💾',
    order: 1,
    subcategories: [
      { id: 'ram-ddr4', name: 'DDR4', order: 1 },
      { id: 'ram-ddr5', name: 'DDR5', order: 2 },
      { id: 'ram-server', name: 'Servidor', order: 3 },
    ]
  },
  {
    id: 'storage',
    name: 'Armazenamento',
    icon: '💽',
    order: 2,
    subcategories: [
      { id: 'storage-ssd', name: 'SSD', order: 1 },
      { id: 'storage-hdd', name: 'HDD', order: 2 },
      { id: 'storage-nvme', name: 'NVMe', order: 3 },
    ]
  },
  {
    id: 'minipc',
    name: 'Mini PCs',
    icon: '🖥️',
    order: 3,
    subcategories: [
      { id: 'minipc-intel', name: 'Intel', order: 1 },
      { id: 'minipc-amd', name: 'AMD', order: 2 },
    ]
  },
  {
    id: 'camera',
    name: 'Câmeras Wi-Fi',
    icon: '📹',
    order: 4,
    subcategories: [
      { id: 'camera-indoor', name: 'Indoor', order: 1 },
      { id: 'camera-outdoor', name: 'Outdoor', order: 2 },
    ]
  },
  {
    id: 'network',
    name: 'Redes e Internet',
    icon: '🌐',
    order: 5,
    subcategories: [
      { id: 'network-router', name: 'Roteadores', order: 1 },
      { id: 'network-switch', name: 'Switches', order: 2 },
      { id: 'network-wifi', name: 'Access Points', order: 3 },
    ]
  },
  {
    id: 'software',
    name: 'Software',
    icon: '💿',
    order: 6,
    subcategories: [
      { id: 'software-os', name: 'Sistemas Operacionais', order: 1 },
      { id: 'software-office', name: 'Produtividade', order: 2 },
      { id: 'software-security', name: 'Segurança', order: 3 },
    ]
  },
  {
    id: 'mobile',
    name: 'Telemóveis',
    icon: '📱',
    order: 7,
    subcategories: [
      { id: 'mobile-smartphone', name: 'Smartphones', order: 1 },
      { id: 'mobile-accessories', name: 'Acessórios', order: 2 },
    ]
  }
];

async function migrateCategories() {
  console.log('🔄 Iniciando migração de categorias...');

  try {
    // Limpar categorias existentes
    console.log('🗑️  Limpando categorias antigas...');
    await prisma.subcategory.deleteMany({});
    await prisma.category.deleteMany({});

    // Criar novas categorias
    console.log('📦 Criando categorias...');
    for (const cat of defaultCategories) {
      console.log(`   → Criando categoria: ${cat.name}`);
      
      const category = await prisma.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          display_order: cat.order,
        }
      });

      // Criar subcategorias
      if (cat.subcategories && cat.subcategories.length > 0) {
        for (const sub of cat.subcategories) {
          console.log(`      → Subcategoria: ${sub.name}`);
          await prisma.subcategory.create({
            data: {
              id: sub.id,
              name: sub.name,
              category_id: category.id,
              order: sub.order,
            }
          });
        }
      }
    }

    console.log('✅ Migração concluída com sucesso!');
    console.log(`📊 Total: ${defaultCategories.length} categorias criadas`);

  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
migrateCategories()
  .then(() => {
    console.log('🎉 Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script falhou:', error);
    process.exit(1);
  });
