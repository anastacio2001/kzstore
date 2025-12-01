/**
 * Script de migração: Supabase → MySQL (Prisma)
 * Execute: npx tsx src/scripts/migrate-supabase-to-mysql.ts
 */

import { createClient } from '@supabase/supabase-js';
import { getPrismaClient } from '../utils/prisma/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const prisma = getPrismaClient();

async function migrateProducts() {
  console.log('\n📦 Migrando PRODUTOS...');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }
  
  console.log(`   Encontrados: ${products?.length || 0} produtos`);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const product of products || []) {
    try {
      // Verificar se já existe
      const existing = await prisma.product.findUnique({
        where: { id: product.id }
      });
      
      if (existing) {
        skipped++;
        continue;
      }
      
      await prisma.product.create({
        data: {
          id: product.id,
          nome: product.nome,
          descricao: product.descricao || '',
          categoria: product.categoria,
          subcategoria: product.subcategoria,
          condicao: product.condicao,
          preco_aoa: product.preco_aoa,
          preco_usd: product.preco_usd,
          custo_aoa: product.custo_aoa,
          margem_lucro: product.margem_lucro,
          estoque: product.estoque || 0,
          estoque_minimo: product.estoque_minimo || 5,
          peso_kg: product.peso_kg,
          imagem_url: product.imagem_url,
          imagens: product.imagens || [],
          especificacoes: product.especificacoes || {},
          marca: product.marca,
          modelo: product.modelo,
          sku: product.sku,
          codigo_barras: product.codigo_barras,
          dimensoes: product.dimensoes || {},
          ativo: product.ativo ?? true,
          destaque: product.destaque ?? false,
          is_featured: product.is_featured ?? false,
          featured_order: product.featured_order,
          fornecedor: product.fornecedor,
          tags: product.tags || [],
          category_id: product.category_id,
          subcategory_id: product.subcategory_id,
          created_at: product.created_at ? new Date(product.created_at) : new Date(),
          updated_at: product.updated_at ? new Date(product.updated_at) : new Date(),
        },
      });
      migrated++;
    } catch (err: any) {
      console.error(`   ⚠️  Erro em "${product.nome}": ${err.message}`);
    }
  }
  
  console.log(`   ✅ Migrados: ${migrated} | Ignorados: ${skipped}`);
}

async function migrateOrders() {
  console.log('\n🛒 Migrando PEDIDOS...');
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*');
  
  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }
  
  console.log(`   Encontrados: ${orders?.length || 0} pedidos`);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const order of orders || []) {
    try {
      const existing = await prisma.order.findUnique({
        where: { id: order.id }
      });
      
      if (existing) {
        skipped++;
        continue;
      }
      
      await prisma.order.create({
        data: {
          id: order.id,
          order_number: order.order_number,
          user_id: order.user_id,
          user_name: order.user_name,
          user_email: order.user_email,
          items: order.items || [],
          subtotal: order.subtotal,
          tax_amount: order.tax_amount,
          discount_amount: order.discount_amount,
          discount_type: order.discount_type,
          discount_details: order.discount_details,
          shipping_cost: order.shipping_cost,
          total: order.total,
          payment_method: order.payment_method,
          payment_status: order.payment_status || 'pending',
          shipping_address: order.shipping_address || {},
          status: order.status || 'pending',
          tracking_number: order.tracking_number,
          notes: order.notes,
          created_at: order.created_at ? new Date(order.created_at) : new Date(),
          updated_at: order.updated_at ? new Date(order.updated_at) : new Date(),
          delivered_at: order.delivered_at ? new Date(order.delivered_at) : null,
          cancelled_at: order.cancelled_at ? new Date(order.cancelled_at) : null,
        },
      });
      migrated++;
    } catch (err: any) {
      console.error(`   ⚠️  Erro em "${order.order_number}": ${err.message}`);
    }
  }
  
  console.log(`   ✅ Migrados: ${migrated} | Ignorados: ${skipped}`);
}

async function migrateReviews() {
  console.log('\n⭐ Migrando REVIEWS...');
  
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*');
  
  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }
  
  console.log(`   Encontradas: ${reviews?.length || 0} avaliações`);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const review of reviews || []) {
    try {
      const existing = await prisma.review.findUnique({
        where: { id: review.id }
      });
      
      if (existing) {
        skipped++;
        continue;
      }
      
      await prisma.review.create({
        data: {
          id: review.id,
          product_id: review.product_id,
          user_id: review.user_id,
          user_name: review.user_name,
          user_email: review.user_email,
          rating: review.rating,
          comment: review.comment,
          is_approved: review.is_approved ?? false,
          is_verified_purchase: review.is_verified_purchase ?? false,
          status: review.status || 'pending',
          created_at: review.created_at ? new Date(review.created_at) : new Date(),
          updated_at: review.updated_at ? new Date(review.updated_at) : new Date(),
        },
      });
      migrated++;
    } catch (err: any) {
      console.error(`   ⚠️  Erro: ${err.message}`);
    }
  }
  
  console.log(`   ✅ Migradas: ${migrated} | Ignoradas: ${skipped}`);
}

async function migrateCoupons() {
  console.log('\n🎟️  Migrando CUPONS...');
  
  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*');
  
  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }
  
  console.log(`   Encontrados: ${coupons?.length || 0} cupons`);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const coupon of coupons || []) {
    try {
      const existing = await prisma.coupon.findUnique({
        where: { id: coupon.id }
      });
      
      if (existing) {
        skipped++;
        continue;
      }
      
      await prisma.coupon.create({
        data: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          max_discount: coupon.max_discount,
          minimum_order_value: coupon.minimum_order_value || 0,
          usage_limit: coupon.usage_limit,
          used_count: coupon.used_count || 0,
          is_active: coupon.is_active ?? true,
          valid_from: coupon.valid_from ? new Date(coupon.valid_from) : new Date(),
          valid_until: coupon.valid_until ? new Date(coupon.valid_until) : null,
          created_at: coupon.created_at ? new Date(coupon.created_at) : new Date(),
          updated_at: coupon.updated_at ? new Date(coupon.updated_at) : new Date(),
        },
      });
      migrated++;
    } catch (err: any) {
      console.error(`   ⚠️  Erro em "${coupon.code}": ${err.message}`);
    }
  }
  
  console.log(`   ✅ Migrados: ${migrated} | Ignorados: ${skipped}`);
}

async function migrateFlashSales() {
  console.log('\n⚡ Migrando FLASH SALES...');
  
  const { data: flashSales, error } = await supabase
    .from('flash_sales')
    .select('*');
  
  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }
  
  console.log(`   Encontradas: ${flashSales?.length || 0} flash sales`);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const sale of flashSales || []) {
    try {
      const existing = await prisma.flashSale.findUnique({
        where: { id: sale.id }
      });
      
      if (existing) {
        skipped++;
        continue;
      }
      
      await prisma.flashSale.create({
        data: {
          id: sale.id,
          product_id: sale.product_id,
          title: sale.title,
          description: sale.description,
          product_name: sale.product_name,
          original_price: sale.original_price,
          sale_price: sale.sale_price,
          discount_percentage: sale.discount_percentage,
          stock_limit: sale.stock_limit,
          stock_sold: sale.stock_sold || 0,
          start_date: new Date(sale.start_date),
          end_date: new Date(sale.end_date),
          is_active: sale.is_active ?? true,
          created_at: sale.created_at ? new Date(sale.created_at) : new Date(),
          updated_at: sale.updated_at ? new Date(sale.updated_at) : new Date(),
        },
      });
      migrated++;
    } catch (err: any) {
      console.error(`   ⚠️  Erro: ${err.message}`);
    }
  }
  
  console.log(`   ✅ Migradas: ${migrated} | Ignoradas: ${skipped}`);
}

async function main() {
  console.log('🚀 MIGRAÇÃO: SUPABASE → MYSQL (PRISMA)');
  console.log('==========================================\n');
  
  try {
    await migrateProducts();
    await migrateOrders();
    await migrateReviews();
    await migrateCoupons();
    await migrateFlashSales();
    
    console.log('\n==========================================');
    console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!\n');
  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
