import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OLD_R2_URL = 'https://pub-2764525461cdfe63446ef25726431505.r2.dev';
const NEW_R2_URL = 'https://pub-8de55063e1d94b86ad80544850260539.r2.dev';

async function updateR2URLs() {
  console.log('🔄 Atualizando URLs do R2 para novo domínio público...\n');

  try {
    // Buscar produtos com URLs antigas do R2
    const products = await prisma.product.findMany({
      where: {
        imagem_url: {
          contains: OLD_R2_URL
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
      console.log('✅ Nenhum produto precisa de atualização!');
      return;
    }

    let updated = 0;

    for (const product of products) {
      const oldUrl = product.imagem_url!;
      const newUrl = oldUrl.replace(OLD_R2_URL, NEW_R2_URL);

      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { imagem_url: newUrl }
        });
        
        updated++;
        console.log(`✅ [${updated}/${products.length}] ${product.nome}`);
        
      } catch (error) {
        console.error(`❌ Erro ao atualizar ${product.nome}:`, error);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`✅ Atualização concluída: ${updated}/${products.length} produtos`);
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateR2URLs();
