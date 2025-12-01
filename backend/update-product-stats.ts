/**
 * Script para atualizar estatísticas dos produtos
 * Calcula: total_vendas, rating_medio, total_avaliacoes
 * 
 * Execução: npx tsx backend/update-product-stats.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProductStatistics() {
  try {
    console.log('📊 Iniciando atualização de estatísticas dos produtos...\n');

    // Buscar todos os produtos
    const products = await prisma.product.findMany({
      select: { id: true, nome: true }
    });

    console.log(`✅ Encontrados ${products.length} produtos\n`);

    for (const product of products) {
      // 1. Calcular total de vendas estimado (baseado em estoque inicial - estoque atual)
      // Você pode ajustar isso conforme a lógica do seu sistema
      const totalVendas = 0; // Por enquanto deixamos em 0, será atualizado manualmente no admin

      // 2. Calcular avaliações aprovadas
      const reviews = await prisma.review.findMany({
        where: {
          product_id: product.id,
          status: 'approved'
        },
        select: {
          rating: true
        }
      });

      const totalAvaliacoes = reviews.length;
      const ratingMedio = totalAvaliacoes > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalAvaliacoes
        : null;

      // 3. Atualizar produto
      await prisma.product.update({
        where: { id: product.id },
        data: {
          total_vendas: totalVendas,
          rating_medio: ratingMedio,
          total_avaliacoes: totalAvaliacoes
        }
      });

      console.log(`✅ ${product.nome}`);
      console.log(`   📦 Vendas: ${totalVendas} (será atualizado no admin)`);
      console.log(`   ⭐ Avaliações: ${totalAvaliacoes} (média: ${ratingMedio ? ratingMedio.toFixed(2) : 'N/A'})`);
      console.log('');
    }

    console.log('\n🎉 Atualização concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar estatísticas:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
updateProductStatistics()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
