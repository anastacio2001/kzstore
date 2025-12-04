import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Calcula Customer Lifetime Value (CLV) médio
 * CLV = Receita Total do Cliente / Número de Clientes
 */
export async function calculateCLV(params?: {
  startDate?: Date;
  endDate?: Date;
  customerId?: string;
}) {
  try {
    const where: any = {};

    if (params?.startDate) {
      where.created_at = { gte: params.startDate };
    }
    if (params?.endDate) {
      where.created_at = { ...where.created_at, lte: params.endDate };
    }
    if (params?.customerId) {
      where.user_id = params.customerId;
    }

    // Buscar todos os pedidos completados
    const orders = await prisma.order.findMany({
      where: {
        ...where,
        status: { in: ['delivered', 'processing', 'shipped'] },
        payment_status: 'paid'
      },
      select: {
        user_id: true,
        user_email: true,
        total: true,
        created_at: true
      }
    });

    // Agrupar por cliente
    const customerData = new Map<string, {
      email: string;
      totalSpent: number;
      orderCount: number;
      firstPurchase: Date;
      lastPurchase: Date;
    }>();

    for (const order of orders) {
      const key = order.user_id || order.user_email;
      const existing = customerData.get(key);

      if (existing) {
        existing.totalSpent += Number(order.total);
        existing.orderCount += 1;
        existing.lastPurchase = order.created_at > existing.lastPurchase
          ? order.created_at
          : existing.lastPurchase;
      } else {
        customerData.set(key, {
          email: order.user_email,
          totalSpent: Number(order.total),
          orderCount: 1,
          firstPurchase: order.created_at,
          lastPurchase: order.created_at
        });
      }
    }

    // Calcular CLV
    const customers = Array.from(customerData.entries()).map(([id, data]) => ({
      customer_id: id,
      email: data.email,
      clv: data.totalSpent,
      total_orders: data.orderCount,
      average_order_value: data.totalSpent / data.orderCount,
      first_purchase: data.firstPurchase,
      last_purchase: data.lastPurchase,
      customer_lifetime_days: Math.floor(
        (data.lastPurchase.getTime() - data.firstPurchase.getTime()) / (1000 * 60 * 60 * 24)
      )
    }));

    // Calcular médias
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.clv, 0);
    const averageCLV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    const averageOrderValue = customers.reduce((sum, c) => sum + c.average_order_value, 0) / totalCustomers;

    // Top 10 clientes por CLV
    const topCustomers = customers
      .sort((a, b) => b.clv - a.clv)
      .slice(0, 10);

    // Salvar métrica no banco
    await prisma.analyticsMetric.create({
      data: {
        metric_type: 'clv',
        metric_value: averageCLV,
        metric_unit: 'AOA',
        date: new Date(),
        period_type: 'daily',
        metadata: {
          total_customers: totalCustomers,
          total_revenue: totalRevenue,
          average_order_value: averageOrderValue
        }
      }
    });

    console.log(`📊 [ANALYTICS] CLV calculado: ${averageCLV.toFixed(2)} AOA`);

    return {
      average_clv: averageCLV,
      total_customers: totalCustomers,
      total_revenue: totalRevenue,
      average_order_value: averageOrderValue,
      customers: params?.customerId ? customers : topCustomers
    };
  } catch (error) {
    console.error('❌ [ANALYTICS] Erro ao calcular CLV:', error);
    throw error;
  }
}

/**
 * Calcula taxa de conversão
 * Taxa de Conversão = (Pedidos / Visitantes) * 100
 */
export async function calculateConversionRate(params?: {
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const where: any = {};

    if (params?.startDate) {
      where.created_at = { gte: params.startDate };
    }
    if (params?.endDate) {
      where.created_at = { ...where.created_at, lte: params.endDate };
    }

    // Contar pedidos completados
    const totalOrders = await prisma.order.count({
      where: {
        ...where,
        status: { in: ['delivered', 'processing', 'shipped'] }
      }
    });

    // Estimar visitantes únicos (baseado em emails únicos de pedidos + carrinhos abandonados)
    const uniqueOrderEmails = await prisma.order.findMany({
      where,
      select: { user_email: true },
      distinct: ['user_email']
    });

    const uniqueCartEmails = await prisma.abandonedCart.findMany({
      where: {
        created_at: where.created_at
      },
      select: { user_email: true },
      distinct: ['user_email']
    });

    const allEmails = new Set([
      ...uniqueOrderEmails.map(o => o.user_email),
      ...uniqueCartEmails.map(c => c.user_email)
    ]);

    const totalVisitors = allEmails.size;
    const conversionRate = totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0;

    // Calcular conversão de carrinho abandonado
    const abandonedCarts = await prisma.abandonedCart.count({
      where: {
        created_at: where.created_at,
        status: 'abandoned'
      }
    });

    const recoveredCarts = await prisma.abandonedCart.count({
      where: {
        created_at: where.created_at,
        status: 'recovered'
      }
    });

    const cartRecoveryRate = (abandonedCarts + recoveredCarts) > 0
      ? (recoveredCarts / (abandonedCarts + recoveredCarts)) * 100
      : 0;

    // Salvar métrica
    await prisma.analyticsMetric.create({
      data: {
        metric_type: 'conversion_rate',
        metric_value: conversionRate,
        metric_unit: '%',
        date: new Date(),
        period_type: 'daily',
        metadata: {
          total_orders: totalOrders,
          total_visitors: totalVisitors,
          cart_recovery_rate: cartRecoveryRate,
          abandoned_carts: abandonedCarts,
          recovered_carts: recoveredCarts
        }
      }
    });

    console.log(`📊 [ANALYTICS] Taxa de conversão: ${conversionRate.toFixed(2)}%`);

    return {
      conversion_rate: conversionRate,
      total_orders: totalOrders,
      total_visitors: totalVisitors,
      cart_recovery_rate: cartRecoveryRate,
      abandoned_carts: abandonedCarts,
      recovered_carts: recoveredCarts
    };
  } catch (error) {
    console.error('❌ [ANALYTICS] Erro ao calcular conversão:', error);
    throw error;
  }
}

/**
 * Relatório de receita detalhado
 */
export async function calculateRevenue(params?: {
  startDate?: Date;
  endDate?: Date;
  groupBy?: 'day' | 'week' | 'month';
}) {
  try {
    const groupBy = params?.groupBy || 'day';
    const where: any = {
      payment_status: 'paid',
      status: { in: ['delivered', 'processing', 'shipped'] }
    };

    if (params?.startDate) {
      where.created_at = { gte: params.startDate };
    }
    if (params?.endDate) {
      where.created_at = { ...where.created_at, lte: params.endDate };
    }

    // Buscar pedidos
    const orders = await prisma.order.findMany({
      where,
      select: {
        total: true,
        shipping_cost: true,
        discount_amount: true,
        created_at: true,
        payment_method: true
      },
      orderBy: { created_at: 'asc' }
    });

    // Calcular totais
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalShipping = orders.reduce((sum, o) => sum + Number(o.shipping_cost || 0), 0);
    const totalDiscounts = orders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);
    const netRevenue = totalRevenue - totalDiscounts;

    // Agrupar por período
    const revenueByPeriod = new Map<string, {
      period: string;
      revenue: number;
      orders: number;
      average_order_value: number;
    }>();

    for (const order of orders) {
      let periodKey: string;
      const date = order.created_at;

      switch (groupBy) {
        case 'day':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          periodKey = date.toISOString().split('T')[0];
      }

      const existing = revenueByPeriod.get(periodKey);
      if (existing) {
        existing.revenue += Number(order.total);
        existing.orders += 1;
        existing.average_order_value = existing.revenue / existing.orders;
      } else {
        revenueByPeriod.set(periodKey, {
          period: periodKey,
          revenue: Number(order.total),
          orders: 1,
          average_order_value: Number(order.total)
        });
      }
    }

    // Agrupar por método de pagamento
    const revenueByPaymentMethod = new Map<string, number>();
    for (const order of orders) {
      const method = order.payment_method || 'Desconhecido';
      revenueByPaymentMethod.set(
        method,
        (revenueByPaymentMethod.get(method) || 0) + Number(order.total)
      );
    }

    // Salvar métrica
    await prisma.analyticsMetric.create({
      data: {
        metric_type: 'revenue',
        metric_value: totalRevenue,
        metric_unit: 'AOA',
        date: new Date(),
        period_type: groupBy === 'day' ? 'daily' : groupBy === 'week' ? 'weekly' : 'monthly',
        metadata: {
          net_revenue: netRevenue,
          total_shipping: totalShipping,
          total_discounts: totalDiscounts,
          total_orders: orders.length
        }
      }
    });

    console.log(`📊 [ANALYTICS] Receita total: ${totalRevenue.toFixed(2)} AOA`);

    return {
      total_revenue: totalRevenue,
      net_revenue: netRevenue,
      total_shipping: totalShipping,
      total_discounts: totalDiscounts,
      total_orders: orders.length,
      average_order_value: orders.length > 0 ? totalRevenue / orders.length : 0,
      revenue_by_period: Array.from(revenueByPeriod.values()),
      revenue_by_payment_method: Array.from(revenueByPaymentMethod.entries()).map(([method, revenue]) => ({
        payment_method: method,
        revenue
      }))
    };
  } catch (error) {
    console.error('❌ [ANALYTICS] Erro ao calcular receita:', error);
    throw error;
  }
}

/**
 * Análise de funil de vendas
 * Mostra onde os clientes desistem no processo de compra
 */
export async function analyzeSalesFunnel(params?: {
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const where: any = {};

    if (params?.startDate || params?.endDate) {
      where.created_at = {};
      if (params.startDate) where.created_at.gte = params.startDate;
      if (params.endDate) where.created_at.lte = params.endDate;
    }

    // Etapa 1: Visitantes (estimado por carrinhos + pedidos)
    const totalCartsCreated = await prisma.abandonedCart.count({
      where: { created_at: where.created_at }
    });

    const totalOrdersCreated = await prisma.order.count({
      where: where.created_at ? { created_at: where.created_at } : {}
    });

    const totalVisitors = totalCartsCreated + totalOrdersCreated;

    // Etapa 2: Adicionou ao carrinho
    const addedToCart = totalCartsCreated + totalOrdersCreated;

    // Etapa 3: Iniciou checkout (pedidos criados)
    const initiatedCheckout = totalOrdersCreated;

    // Etapa 4: Completou pedido (payment_status = paid)
    const completedOrders = await prisma.order.count({
      where: {
        ...(where.created_at && { created_at: where.created_at }),
        payment_status: 'paid'
      }
    });

    // Etapa 5: Pedido entregue
    const deliveredOrders = await prisma.order.count({
      where: {
        ...(where.created_at && { created_at: where.created_at }),
        status: 'delivered'
      }
    });

    // Calcular taxas de conversão entre etapas
    const funnel = [
      {
        stage: 'Visitantes',
        count: totalVisitors,
        percentage: 100,
        drop_off: 0
      },
      {
        stage: 'Adicionou ao Carrinho',
        count: addedToCart,
        percentage: totalVisitors > 0 ? (addedToCart / totalVisitors) * 100 : 0,
        drop_off: totalVisitors - addedToCart
      },
      {
        stage: 'Iniciou Checkout',
        count: initiatedCheckout,
        percentage: addedToCart > 0 ? (initiatedCheckout / addedToCart) * 100 : 0,
        drop_off: addedToCart - initiatedCheckout
      },
      {
        stage: 'Completou Pedido',
        count: completedOrders,
        percentage: initiatedCheckout > 0 ? (completedOrders / initiatedCheckout) * 100 : 0,
        drop_off: initiatedCheckout - completedOrders
      },
      {
        stage: 'Pedido Entregue',
        count: deliveredOrders,
        percentage: completedOrders > 0 ? (deliveredOrders / completedOrders) * 100 : 0,
        drop_off: completedOrders - deliveredOrders
      }
    ];

    console.log(`📊 [ANALYTICS] Funil de vendas calculado`);

    return {
      funnel,
      overall_conversion: totalVisitors > 0 ? (deliveredOrders / totalVisitors) * 100 : 0,
      biggest_drop_off: funnel.reduce((max, stage) =>
        stage.drop_off > max.drop_off ? stage : max
      , funnel[0])
    };
  } catch (error) {
    console.error('❌ [ANALYTICS] Erro ao analisar funil:', error);
    throw error;
  }
}

/**
 * Buscar métricas históricas
 */
export async function getHistoricalMetrics(params: {
  metricType: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  try {
    const where: any = {
      metric_type: params.metricType
    };

    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) where.date.gte = params.startDate;
      if (params.endDate) where.date.lte = params.endDate;
    }

    const metrics = await prisma.analyticsMetric.findMany({
      where,
      orderBy: { date: 'desc' },
      take: params.limit || 30
    });

    return metrics;
  } catch (error) {
    console.error('❌ [ANALYTICS] Erro ao buscar métricas:', error);
    throw error;
  }
}
