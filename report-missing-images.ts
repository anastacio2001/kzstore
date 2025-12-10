import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateMissingImagesReport() {
  try {
    // Buscar produtos com placeholder
    const productsWithPlaceholder = await prisma.product.findMany({
      where: {
        imagem_url: {
          contains: 'placeholder.com'
        }
      },
      select: {
        id: true,
        nome: true,
        categoria: true,
        preco_aoa: true,
        estoque: true,
      },
      orderBy: {
        nome: 'asc'
      }
    });

    console.log('📋 RELATÓRIO DE PRODUTOS SEM IMAGEM\n');
    console.log('='.repeat(80));
    console.log(`Total de produtos sem imagem: ${productsWithPlaceholder.length}\n`);

    if (productsWithPlaceholder.length === 0) {
      console.log('✅ Todos os produtos têm imagens!\n');
      return;
    }

    console.log('Lista de produtos que precisam de upload de imagem:\n');
    
    productsWithPlaceholder.forEach((product, index) => {
      console.log(`${index + 1}. ${product.nome}`);
      console.log(`   Categoria: ${product.categoria || 'N/A'}`);
      console.log(`   Preço: ${product.preco_aoa?.toFixed(2)} AOA`);
      console.log(`   Estoque: ${product.estoque || 0} unidades`);
      console.log(`   Link admin: https://kzstore.ao/admin/products/edit/${product.id}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\n📝 Como fazer upload das imagens:\n');
    console.log('1. Acesse: https://kzstore.ao/admin');
    console.log('2. Vá em "Produtos" → "Gerenciar Produtos"');
    console.log('3. Clique em "Editar" no produto');
    console.log('4. Faça upload da imagem correta');
    console.log('5. Clique em "Salvar"');
    console.log('\nO sistema salvará automaticamente no Cloudflare R2! ✅\n');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateMissingImagesReport();
