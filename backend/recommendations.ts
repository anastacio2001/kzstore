import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Recomendações baseadas em "Clientes que compraram X também compraram Y"
 * Algoritmo: Collaborative Filtering simples
 */
export async function getProductRecommendations(
  productId: string,
  limit: number = 5
): Promise<any[]> {
  try {
    // 1. Buscar pedidos que contêm este produto
    const ordersWithProduct = await prisma.order.findMany({
      where: {
        items: {
          path: '$[*].product_id',
          array_contains: productId
        },
        status: { in: ['delivered', 'processing', 'shipped'] }
      },
      select: {
        items: true
      }
    });

    // 2. Extrair todos os produtos comprados junto
    const productFrequency = new Map<string, number>();

    for (const order of ordersWithProduct) {
      let items: any[] = [];

      try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch {
        continue;
      }

      for (const item of items) {
        const pid = item.product_id || item.id;
        if (pid && pid !== productId) {
          productFrequency.set(pid, (productFrequency.get(pid) || 0) + 1);
        }
      }
    }

    // 3. Ordenar por frequência
    const sortedProducts = Array.from(productFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    // 4. Buscar detalhes dos produtos recomendados
    if (sortedProducts.length === 0) {
      // Fallback: produtos da mesma categoria
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { categoria: true }
      });

      if (product) {
        return await prisma.product.findMany({
          where: {
            categoria: product.categoria,
            id: { not: productId },
            ativo: true,
            estoque: { gt: 0 }
          },
          take: limit,
          orderBy: { destaque: 'desc' }
        });
      }

      return [];
    }

    const recommendations = await prisma.product.findMany({
      where: {
        id: { in: sortedProducts },
        ativo: true
      }
    });

    // Manter ordem de relevância
    const ordered = sortedProducts
      .map(id => recommendations.find(p => p.id === id))
      .filter(Boolean);

    console.log(`🎯 [RECOMMENDATIONS] ${ordered.length} recomendações para produto ${productId}`);

    return ordered as any[];
  } catch (error) {
    console.error('❌ [RECOMMENDATIONS] Erro:', error);
    return [];
  }
}

/**
 * Recomendações personalizadas para usuário
 * Baseadas em histórico de compras e navegação
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    // 1. Buscar histórico de pedidos do usuário
    const userOrders = await prisma.order.findMany({
      where: {
        user_id: userId,
        status: { in: ['delivered', 'processing', 'shipped'] }
      },
      select: { items: true },
      orderBy: { created_at: 'desc' },
      take: 10 // Últimos 10 pedidos
    });

    // 2. Extrair produtos comprados
    const purchasedProductIds = new Set<string>();
    const categories = new Set<string>();

    for (const order of userOrders) {
      let items: any[] = [];
      try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch {
        continue;
      }

      for (const item of items) {
        const pid = item.product_id || item.id;
        if (pid) purchasedProductIds.add(pid);
      }
    }

    // 3. Buscar categorias dos produtos comprados
    const purchasedProducts = await prisma.product.findMany({
      where: { id: { in: Array.from(purchasedProductIds) } },
      select: { categoria: true }
    });

    purchasedProducts.forEach(p => categories.add(p.categoria));

    // 4. Buscar produtos relacionados que o usuário ainda não comprou
    const recommendations = await prisma.product.findMany({
      where: {
        categoria: { in: Array.from(categories) },
        id: { notIn: Array.from(purchasedProductIds) },
        ativo: true,
        estoque: { gt: 0 }
      },
      take: limit,
      orderBy: [
        { destaque: 'desc' },
        { created_at: 'desc' }
      ]
    });

    // 5. Se não houver recomendações, retornar produtos populares
    if (recommendations.length === 0) {
      return await getPopularProducts(limit);
    }

    console.log(`🎯 [RECOMMENDATIONS] ${recommendations.length} recomendações personalizadas para usuário ${userId}`);

    return recommendations;
  } catch (error) {
    console.error('❌ [RECOMMENDATIONS] Erro:', error);
    return [];
  }
}

/**
 * Produtos populares (mais vendidos)
 */
export async function getPopularProducts(limit: number = 10): Promise<any[]> {
  try {
    // Buscar todos os pedidos recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: {
        created_at: { gte: thirtyDaysAgo },
        status: { in: ['delivered', 'processing', 'shipped'] }
      },
      select: { items: true }
    });

    // Contar vendas por produto
    const productSales = new Map<string, number>();

    for (const order of orders) {
      let items: any[] = [];
      try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch {
        continue;
      }

      for (const item of items) {
        const pid = item.product_id || item.id;
        const quantity = item.quantity || 1;
        if (pid) {
          productSales.set(pid, (productSales.get(pid) || 0) + quantity);
        }
      }
    }

    // Ordenar por vendas
    const topProductIds = Array.from(productSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    if (topProductIds.length === 0) {
      // Fallback: produtos em destaque
      return await prisma.product.findMany({
        where: {
          ativo: true,
          destaque: true,
          estoque: { gt: 0 }
        },
        take: limit,
        orderBy: { created_at: 'desc' }
      });
    }

    const popularProducts = await prisma.product.findMany({
      where: {
        id: { in: topProductIds },
        ativo: true
      }
    });

    // Manter ordem de popularidade
    const ordered = topProductIds
      .map(id => popularProducts.find(p => p.id === id))
      .filter(Boolean);

    console.log(`🔥 [RECOMMENDATIONS] ${ordered.length} produtos populares`);

    return ordered as any[];
  } catch (error) {
    console.error('❌ [RECOMMENDATIONS] Erro:', error);
    return [];
  }
}

/**
 * Produtos relacionados por categoria
 */
export async function getRelatedProducts(
  productId: string,
  limit: number = 4
): Promise<any[]> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoria: true, subcategoria: true }
    });

    if (!product) return [];

    // Priorizar mesma subcategoria, depois mesma categoria
    const related = await prisma.product.findMany({
      where: {
        id: { not: productId },
        ativo: true,
        estoque: { gt: 0 },
        OR: [
          {
            categoria: product.categoria,
            subcategoria: product.subcategoria
          },
          {
            categoria: product.categoria
          }
        ]
      },
      take: limit,
      orderBy: [
        { destaque: 'desc' },
        { created_at: 'desc' }
      ]
    });

    console.log(`🔗 [RECOMMENDATIONS] ${related.length} produtos relacionados`);

    return related;
  } catch (error) {
    console.error('❌ [RECOMMENDATIONS] Erro:', error);
    return [];
  }
}

/**
 * Produtos em tendência (mais visualizados recentemente)
 * Nota: Requer tracking de visualizações (implementar no futuro)
 */
export async function getTrendingProducts(limit: number = 10): Promise<any[]> {
  try {
    // Por enquanto, retorna produtos novos e em destaque
    const trending = await prisma.product.findMany({
      where: {
        ativo: true,
        destaque: true,
        estoque: { gt: 0 }
      },
      take: limit,
      orderBy: { created_at: 'desc' }
    });

    console.log(`📈 [RECOMMENDATIONS] ${trending.length} produtos em tendência`);

    return trending;
  } catch (error) {
    console.error('❌ [RECOMMENDATIONS] Erro:', error);
    return [];
  }
}
