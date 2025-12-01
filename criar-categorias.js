/**
 * Script para criar categorias e subcategorias
 * 
 * USO: node criar-categorias.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categorias = [
  {
    name: 'RAM',
    description: 'Memórias RAM para servidores e workstations',
    slug: 'ram',
    icon: '🔲',
    order: 1,
    active: true
  },
  {
    name: 'HDD',
    description: 'Hard Disks tradicionais',
    slug: 'hdd',
    icon: '💿',
    order: 2,
    active: true
  },
  {
    name: 'SSD',
    description: 'Solid State Drives de alta performance',
    slug: 'ssd',
    icon: '⚡',
    order: 3,
    active: true
  },
  {
    name: 'Processador',
    description: 'Processadores Intel e AMD',
    slug: 'processador',
    icon: '🔧',
    order: 4,
    active: true
  },
  {
    name: 'Placa Mãe',
    description: 'Placas mãe para servidores',
    slug: 'placa-mae',
    icon: '🖥️',
    order: 5,
    active: true
  },
  {
    name: 'Fonte',
    description: 'Fontes de alimentação',
    slug: 'fonte',
    icon: '🔌',
    order: 6,
    active: true
  },
  {
    name: 'Rede',
    description: 'Equipamentos de rede',
    slug: 'rede',
    icon: '🌐',
    order: 7,
    active: true
  },
  {
    name: 'Gabinete',
    description: 'Gabinetes e cases',
    slug: 'gabinete',
    icon: '📦',
    order: 8,
    active: true
  },
  {
    name: 'Periféricos',
    description: 'Teclados, mouses e acessórios',
    slug: 'perifericos',
    icon: '⌨️',
    order: 9,
    active: true
  }
];

async function criarCategorias() {
  try {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║      CRIAR CATEGORIAS - KZSTORE                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const count = await prisma.category.count();
    
    if (count > 0) {
      console.log(`⚠️  Já existem ${count} categorias no banco!\n`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('📁 Criando categorias...\n');
    
    let criadas = 0;
    let erros = 0;

    for (const categoria of categorias) {
      try {
        const existing = await prisma.category.findUnique({
          where: { slug: categoria.slug }
        });

        if (existing) {
          console.log(`⚠️  ${categoria.name} já existe`);
          continue;
        }

        await prisma.category.create({
          data: categoria
        });
        criadas++;
        console.log(`✅ ${categoria.icon} ${categoria.name}`);
      } catch (error) {
        erros++;
        console.log(`❌ Erro ao criar "${categoria.nome}":`, error.message);
      }
    }

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              RESUMO                                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`   ✅ Categorias criadas: ${criadas}`);
    console.log(`   ❌ Erros: ${erros}`);
    console.log(`   📊 Total no banco: ${await prisma.category.count()}\n`);

    if (criadas > 0) {
      console.log('🎉 Categorias criadas com sucesso!\n');
    }

  } catch (error) {
    console.error('\n❌ Erro ao criar categorias:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

criarCategorias();
