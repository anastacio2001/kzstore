/**
 * Script para marcar um produto como pré-venda
 * Uso: ts-node mark-product-as-preorder.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function markProductAsPreOrder() {
  try {
    console.log('🔍 Procurando produtos com "AirPods" no nome...\n');

    // Procurar todos os produtos com AirPods no nome
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { nome: { contains: 'AirPods', mode: 'insensitive' } },
          { nome: { contains: 'Airpods', mode: 'insensitive' } },
          { nome: { contains: 'airpods', mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        nome: true,
        preco_aoa: true,
        is_pre_order: true,
        pre_order_info: true,
        ativo: true,
      }
    });

    if (products.length === 0) {
      console.log('❌ Nenhum produto com "AirPods" encontrado.');
      console.log('\n📋 Listando os primeiros 10 produtos para você escolher:\n');
      
      const allProducts = await prisma.product.findMany({
        take: 20,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          nome: true,
          preco_aoa: true,
          is_pre_order: true,
        }
      });

      allProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.nome.substring(0, 50)} - ${p.preco_aoa} Kz - Pre-order: ${p.is_pre_order}`);
      });

      console.log('\n💡 Edite este script e coloque o ID do produto que deseja marcar como pré-venda.');
      return;
    }

    console.log(`✅ Encontrados ${products.length} produto(s):\n`);
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.nome}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Preço: ${p.preco_aoa} Kz`);
      console.log(`   Ativo: ${p.ativo}`);
      console.log(`   Pré-venda atual: ${p.is_pre_order}`);
      console.log('');
    });

    // Marcar o primeiro como pré-venda
    const productToUpdate = products[0];
    
    console.log(`🔄 Marcando "${productToUpdate.nome}" como pré-venda...\n`);

    const estimatedArrival = new Date();
    estimatedArrival.setDate(estimatedArrival.getDate() + 45); // 45 dias

    const updated = await prisma.product.update({
      where: { id: productToUpdate.id },
      data: {
        is_pre_order: true,
        pre_order_info: {
          estimated_arrival: estimatedArrival.toISOString(),
          deposit_percentage: 30,
          max_reservations: 50,
          reserved_count: 0,
          status: 'in_transit'
        }
      }
    });

    console.log('✅ Produto atualizado com sucesso!');
    console.log('\n📦 Informações de pré-venda:');
    console.log(`   ✅ is_pre_order: ${updated.is_pre_order}`);
    console.log(`   📅 Data chegada estimada: ${estimatedArrival.toLocaleDateString('pt-PT')}`);
    console.log(`   💰 Percentual de sinal: 30%`);
    console.log(`   📊 Máximo de reservas: 50`);
    console.log(`   🚢 Status: em trânsito`);
    
    console.log('\n🎉 Produto marcado como pré-venda!');
    console.log('   👉 Acesse o painel admin → Produtos Pré-venda');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Se quiser marcar um produto específico por ID, descomente e use:
async function markSpecificProduct(productId: string) {
  try {
    const estimatedArrival = new Date();
    estimatedArrival.setDate(estimatedArrival.getDate() + 45);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        is_pre_order: true,
        pre_order_info: {
          estimated_arrival: estimatedArrival.toISOString(),
          deposit_percentage: 30,
          max_reservations: 50,
          reserved_count: 0,
          status: 'in_transit'
        }
      }
    });

    console.log('✅ Produto marcado como pré-venda:', updated.nome);
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
markProductAsPreOrder();

// Ou marque um produto específico (descomente e coloque o ID):
// markSpecificProduct('SEU_PRODUTO_ID_AQUI');
