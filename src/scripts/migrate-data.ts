/**
 * Script de migração de dados: Supabase → MySQL (Prisma)
 * Execute este script depois de configurar o MySQL
 */

import { getSupabaseClient } from '../utils/supabase/client';
import { getPrismaClient } from '../utils/prisma/client';

const supabase = getSupabaseClient();
const prisma = getPrismaClient();

/**
 * Migrar produtos do Supabase para MySQL
 */
async function migrateProducts() {
  console.log('📦 Migrando produtos...');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    return;
  }
  
  console.log(`Encontrados ${products?.length || 0} produtos`);
  
  for (const product of products || []) {
    try {
      await prisma.product.create({
        data: {
          id: product.id,
          nome: product.nome,
          descricao: product.descricao,
          categoria: product.categoria,
          subcategoria: product.subcategoria,
          condicao: product.condicao,
          preco_aoa: product.preco_aoa,
          preco_usd: product.preco_usd,
          custo_aoa: product.custo_aoa,
          margem_lucro: product.margem_lucro,
          estoque: product.estoque,
          estoque_minimo: product.estoque_minimo,
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
      console.log(`✅ Produto migrado: ${product.nome}`);
    } catch (err) {
      console.error(`❌ Erro ao migrar produto ${product.nome}:`, err);
    }
  }
}

/**
 * Migrar pedidos do Supabase para MySQL
 */
async function migrateOrders() {
  console.log('🛒 Migrando pedidos...');
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*');
  
  if (error) {
    console.error('❌ Erro ao buscar pedidos:', error);
    return;
  }
  
  console.log(`Encontrados ${orders?.length || 0} pedidos`);
  
  for (const order of orders || []) {
    try {
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
      console.log(`✅ Pedido migrado: ${order.order_number}`);
    } catch (err) {
      console.error(`❌ Erro ao migrar pedido ${order.order_number}:`, err);
    }
  }
}

/**
 * Migrar avaliações do Supabase para MySQL
 */
async function migrateReviews() {
  console.log('⭐ Migrando avaliações...');
  
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*');
  
  if (error) {
    console.error('❌ Erro ao buscar avaliações:', error);
    return;
  }
  
  console.log(`Encontradas ${reviews?.length || 0} avaliações`);
  
  for (const review of reviews || []) {
    try {
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
      console.log(`✅ Avaliação migrada: ${review.id}`);
    } catch (err) {
      console.error(`❌ Erro ao migrar avaliação ${review.id}:`, err);
    }
  }
}

/**
 * Migrar cupons do Supabase para MySQL
 */
async function migrateCoupons() {
  console.log('🎟️ Migrando cupons...');
  
  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*');
  
  if (error) {
    console.error('❌ Erro ao buscar cupons:', error);
    return;
  }
  
  console.log(`Encontrados ${coupons?.length || 0} cupons`);
  
  for (const coupon of coupons || []) {
    try {
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
      console.log(`✅ Cupom migrado: ${coupon.code}`);
    } catch (err) {
      console.error(`❌ Erro ao migrar cupom ${coupon.code}:`, err);
    }
  }
}

/**
 * Executar todas as migrações
 */
async function migrateAll() {
  try {
    console.log('🚀 Iniciando migração de dados do Supabase para MySQL...\n');
    
    await migrateProducts();
    console.log('\n');
    
    await migrateOrders();
    console.log('\n');
    
    await migrateReviews();
    console.log('\n');
    
    await migrateCoupons();
    console.log('\n');
    
    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
// Descomentar a linha abaixo para executar
// migrateAll();

export { migrateProducts, migrateOrders, migrateReviews, migrateCoupons, migrateAll };
