import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLACEHOLDER_URL = 'https://via.placeholder.com/400x400/E31E24/FFFFFF?text=KZSTORE';

async function fixBrokenImages() {
  console.log('🔍 Buscando produtos com imagens do Google Cloud Storage...\n');

  try {
    // Buscar produtos com URLs do Google Storage
    const products = await prisma.product.findMany({
      where: {
        imagem_url: {
          contains: 'storage.googleapis.com'
        }
      },
      select: {
        id: true,
        nome: true,
        imagem_url: true
      }
    });

    console.log(`📦 Produtos encontrados: ${products.length}\n`);

    if (products.length === 0) {
      console.log('✅ Nenhum produto com URLs do Google Storage!');
      return;
    }

    // Mostrar exemplos
    console.log('📋 Exemplos:');
    products.slice(0, 5).forEach(p => {
      console.log(`  - ${p.nome}`);
    });
    console.log('');

    console.log('🔧 Atualizando para placeholder temporário...\n');

    let updated = 0;

    for (const product of products) {
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { imagem_url: PLACEHOLDER_URL }
        });
        
        updated++;
        console.log(`✅ [${updated}/${products.length}] ${product.nome}`);
        
      } catch (error) {
        console.error(`❌ Erro ao atualizar ${product.nome}:`, error);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Atualização concluída!`);
    console.log(`📊 Produtos atualizados: ${updated}/${products.length}`);
    console.log('='.repeat(60));
    console.log('\n📝 Próximos passos:');
    console.log('   1. Os produtos agora exibem um placeholder vermelho');
    console.log('   2. Acesse o painel admin: https://kzstore.ao/admin');
    console.log('   3. Faça re-upload das imagens corretas');
    console.log('   4. O sistema salvará no Cloudflare R2 automaticamente\n');

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixBrokenImages();
