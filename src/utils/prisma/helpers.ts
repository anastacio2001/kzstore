/**
 * Helpers para operações comuns com Prisma
 * Migrado do Supabase para Prisma
 */

import { getPrismaClient } from './client';
import type { Product, Order, Review, Coupon } from '../../types';

const prisma = getPrismaClient();

// ============================================
// PRODUTOS
// ============================================

/**
 * Buscar todos os produtos ativos
 */
export async function getAllProducts() {
  return await prisma.product.findMany({
    where: { ativo: true },
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Buscar produto por ID
 */
export async function getProductById(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: {
        where: { is_approved: true },
        orderBy: { created_at: 'desc' },
      },
      flashSales: {
        where: {
          is_active: true,
          start_date: { lte: new Date() },
          end_date: { gte: new Date() },
        },
      },
    },
  });
}

/**
 * Buscar produtos por categoria
 */
export async function getProductsByCategory(categoria: string) {
  return await prisma.product.findMany({
    where: {
      categoria,
      ativo: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Criar novo produto
 */
export async function createProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  return await prisma.product.create({
    data: {
      ...data,
      imagens: data.imagens as any,
      especificacoes: data.especificacoes as any,
      tags: data.tags as any,
      dimensoes: data.dimensoes as any,
    },
  });
}

/**
 * Atualizar produto
 */
export async function updateProduct(id: string, data: Partial<Product>) {
  return await prisma.product.update({
    where: { id },
    data: {
      ...data,
      imagens: data.imagens as any,
      especificacoes: data.especificacoes as any,
      tags: data.tags as any,
      dimensoes: data.dimensoes as any,
    },
  });
}

/**
 * Deletar produto
 */
export async function deleteProduct(id: string) {
  return await prisma.product.delete({
    where: { id },
  });
}

/**
 * Atualizar estoque do produto
 */
export async function updateProductStock(id: string, quantidade: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  
  if (!product) throw new Error('Produto não encontrado');
  
  const newStock = product.estoque + quantidade;
  
  // Criar histórico de estoque
  await prisma.stockHistory.create({
    data: {
      product_id: id,
      product_name: product.nome,
      old_stock: product.estoque,
      new_stock: newStock,
      change_amount: quantidade,
      reason: quantidade > 0 ? 'Reposição' : 'Venda',
    },
  });
  
  // Atualizar estoque
  return await prisma.product.update({
    where: { id },
    data: { estoque: newStock },
  });
}

// ============================================
// PEDIDOS
// ============================================

/**
 * Criar novo pedido
 */
export async function createOrder(data: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
  return await prisma.order.create({
    data: {
      ...data,
      items: data.items as any,
      shipping_address: data.shipping_address as any,
    },
  });
}

/**
 * Buscar pedido por ID
 */
export async function getOrderById(id: string) {
  return await prisma.order.findUnique({
    where: { id },
  });
}

/**
 * Buscar pedidos por email do usuário
 */
export async function getOrdersByUserEmail(email: string) {
  return await prisma.order.findMany({
    where: { user_email: email },
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Atualizar status do pedido
 */
export async function updateOrderStatus(id: string, status: string) {
  return await prisma.order.update({
    where: { id },
    data: { status },
  });
}

// ============================================
// AVALIAÇÕES
// ============================================

/**
 * Criar nova avaliação
 */
export async function createReview(data: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
  return await prisma.review.create({
    data,
  });
}

/**
 * Buscar avaliações de um produto
 */
export async function getReviewsByProductId(productId: string) {
  return await prisma.review.findMany({
    where: {
      product_id: productId,
      is_approved: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Aprovar avaliação
 */
export async function approveReview(id: string) {
  return await prisma.review.update({
    where: { id },
    data: { is_approved: true, status: 'approved' },
  });
}

// ============================================
// CUPONS
// ============================================

/**
 * Validar cupom
 */
export async function validateCoupon(code: string) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });
  
  if (!coupon) {
    throw new Error('Cupom não encontrado');
  }
  
  if (!coupon.is_active) {
    throw new Error('Cupom inativo');
  }
  
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    throw new Error('Cupom expirado');
  }
  
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    throw new Error('Cupom atingiu limite de uso');
  }
  
  return coupon;
}

/**
 * Usar cupom (incrementar contador)
 */
export async function useCoupon(id: string) {
  return await prisma.coupon.update({
    where: { id },
    data: {
      used_count: { increment: 1 },
    },
  });
}

// ============================================
// FLASH SALES
// ============================================

/**
 * Buscar flash sales ativas
 */
export async function getActiveFlashSales() {
  return await prisma.flashSale.findMany({
    where: {
      is_active: true,
      start_date: { lte: new Date() },
      end_date: { gte: new Date() },
    },
    include: {
      product: true,
    },
  });
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Registrar evento de analytics
 */
export async function trackEvent(data: {
  event_type: string;
  session_id: string;
  user_email?: string;
  metadata?: any;
}) {
  return await prisma.analyticsEvent.create({
    data: {
      ...data,
      metadata: data.metadata as any,
    },
  });
}
