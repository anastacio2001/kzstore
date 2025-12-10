import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProductImages() {
  console.log('🔍 Buscando produtos com URLs de imagem quebradas...\n');

  try {
    // Buscar todos os produtos
    const products = await prisma.product.findMany({
      select: {
        id: true,
        nome: true,
        imagem_url: true
      }
    });

    console.log(`📦 Total de produtos: ${products.length}\n`);

    const brokenProducts = products.filter(p => {
      const url = p.imagem_url || '';
      // Detectar URLs quebradas (não começam com http/https)
      return url && !url.startsWith('http://') && !url.startsWith('https://');
    });

    console.log(`❌ Produtos com imagens quebradas: ${brokenProducts.length}\n`);

    if (brokenProducts.length === 0) {
      console.log('✅ Todos os produtos têm URLs válidas!');
      return;
    }

    // Mostrar exemplos
    console.log('📋 Exemplos de URLs quebradas:');
    brokenProducts.slice(0, 5).forEach(p => {
      console.log(`  - ${p.nome}: "${p.imagem_url}"`);
    });
    console.log('');

    // Confirmar correção
    console.log('🔧 Corrigindo URLs para usar proxy com fallback...\n');

    let fixed = 0;
    const backendUrl = process.env.BACKEND_URL || 'https://kzstore-backend.fly.dev';

    for (const product of brokenProducts) {
      const oldUrl = product.imagem_url || '';
      
      // Extrair filename da URL quebrada
      let filename = oldUrl;
      
      // Remover / inicial se existir
      if (filename.startsWith('/')) {
        filename = filename.substring(1);
      }
      
      // Se tiver caminho relativo, pegar apenas o nome do arquivo
      if (filename.includes('/')) {
        const parts = filename.split('/');
        filename = parts[parts.length - 1];
      }

      // Nova URL usando o proxy
      const newUrl = `${backendUrl}/api/image-proxy/${filename}`;

      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { imagem_url: newUrl }
        });
        
        fixed++;
        console.log(`✅ [${fixed}/${brokenProducts.length}] ${product.nome}`);
        console.log(`   Antes: ${oldUrl}`);
        console.log(`   Depois: ${newUrl}\n`);
        
      } catch (error) {
        console.error(`❌ Erro ao atualizar ${product.nome}:`, error);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Correção concluída!`);
    console.log(`📊 Produtos corrigidos: ${fixed}/${brokenProducts.length}`);
    console.log('='.repeat(60));
    console.log('\n📝 Como funciona:');
    console.log('   1. URLs agora apontam para /api/image-proxy/:filename');
    console.log('   2. Backend tenta buscar imagem do Cloudflare R2');
    console.log('   3. Se não encontrar, retorna placeholder automaticamente');
    console.log('   4. Você pode fazer re-upload das imagens pelo admin');
    console.log('   5. Quando fizer upload, atualize a URL do produto\n');

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixProductImages();
