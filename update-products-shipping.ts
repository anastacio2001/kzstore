import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProductsShipping() {
  try {
    console.log('🔄 Atualizando produtos sem shipping_type definido...');
    
    // Atualizar produtos sem shipping_type ou com paid mas custo 0
    const result = await prisma.$executeRaw`
      UPDATE products 
      SET 
        shipping_type = 'free',
        shipping_cost_aoa = 0,
        shipping_cost_usd = 0
      WHERE shipping_type IS NULL 
         OR shipping_type = ''
         OR (shipping_type = 'paid' AND shipping_cost_aoa = 0)
    `;
    
    console.log(`✅ ${result} produtos atualizados com frete grátis`);
    
    // Contar produtos com frete grátis
    const freeShipping = await prisma.product.count({
      where: { shipping_type: 'free' }
    });
    
    console.log(`📦 Total de produtos com frete grátis: ${freeShipping}`);
    
    // Contar produtos com frete pago
    const paidShipping = await prisma.product.count({
      where: { shipping_type: 'paid' }
    });
    
    console.log(`💰 Total de produtos com frete pago: ${paidShipping}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar produtos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductsShipping();
