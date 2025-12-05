import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { calculateCLV, calculateConversionRate, calculateRevenue } from './analytics';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * CRON JOB 1: Alertas de estoque baixo
 * Envia email quando produtos estão abaixo do estoque mínimo
 * Frequência recomendada: A cada 30 minutos
 */
export async function checkLowStockAlerts(): Promise<{
  alerts_sent: number;
  products_checked: number;
  low_stock_products: any[];
}> {
  try {
    console.log('📦 [CRON] Verificando alertas de estoque baixo...');

    // Buscar produtos com estoque baixo
    const lowStockProducts = await prisma.product.findMany({
      where: {
        AND: [
          { ativo: true },
          {
            OR: [
              { estoque: { lte: prisma.product.fields.estoque_minimo } },
              { estoque: { equals: 0 } }
            ]
          }
        ]
      },
      select: {
        id: true,
        nome: true,
        estoque: true,
        estoque_minimo: true,
        preco_aoa: true,
        categoria: true,
        sku: true
      }
    });

    console.log(`📊 [CRON] ${lowStockProducts.length} produtos com estoque baixo`);

    let alerts_sent = 0;

    if (lowStockProducts.length > 0) {
      // Preparar lista de produtos para email
      const productsList = lowStockProducts
        .map(p => {
          const status = p.estoque === 0 ? '🔴 ESGOTADO' : '⚠️ BAIXO';
          return `${status} - ${p.nome} (SKU: ${p.sku || 'N/A'})\n   Estoque atual: ${p.estoque} | Mínimo: ${p.estoque_minimo}`;
        })
        .join('\n\n');

      // Enviar email para administradores
      const adminEmails = process.env.ADMIN_NOTIFICATION_EMAILS?.split(',') || [];

      for (const email of adminEmails) {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'noreply@kzstore.ao',
            to: email.trim(),
            subject: `⚠️ KZSTORE - ${lowStockProducts.length} Produtos com Estoque Baixo`,
            html: `
              <h2>Alerta de Estoque Baixo</h2>
              <p>Os seguintes produtos precisam de reposição:</p>
              <pre style="font-family: monospace; background: #f5f5f5; padding: 15px; border-radius: 5px;">
${productsList}
              </pre>
              <p><strong>Total de produtos afetados:</strong> ${lowStockProducts.length}</p>
              <hr>
              <p style="color: #666; font-size: 12px;">
                Este é um alerta automático enviado pelo sistema KZSTORE.<br>
                Para gerenciar o estoque, acesse o painel administrativo.
              </p>
            `
          });
          alerts_sent++;
          console.log(`✅ [CRON] Alerta enviado para ${email}`);
        } catch (error: any) {
          console.error(`❌ [CRON] Erro ao enviar email para ${email}:`, error.message);
        }
      }
    }

    return {
      alerts_sent,
      products_checked: lowStockProducts.length,
      low_stock_products: lowStockProducts
    };
  } catch (error) {
    console.error('❌ [CRON] Erro na verificação de estoque:', error);
    throw error;
  }
}

/**
 * CRON JOB 2: Processar carrinhos abandonados
 * Envia emails de lembrete para clientes com carrinhos abandonados
 * Frequência recomendada: A cada 1 hora
 */
export async function processAbandonedCarts(): Promise<{
  carts_processed: number;
  emails_sent: number;
  abandoned_carts: any[];
}> {
  try {
    console.log('🛒 [CRON] Processando carrinhos abandonados...');

    // Buscar carrinhos criados há mais de 2 horas e não convertidos em pedidos
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const abandonedCarts = await prisma.cart.findMany({
      where: {
        created_at: { lte: twoHoursAgo },
        updated_at: { lte: twoHoursAgo },
        items: { not: '[]' } // Tem itens no carrinho
      },
      take: 50 // Processar no máximo 50 por vez
    });

    console.log(`📊 [CRON] ${abandonedCarts.length} carrinhos abandonados encontrados`);

    let emails_sent = 0;

    for (const cart of abandonedCarts) {
      try {
        // Buscar informações do usuário
        const user = await prisma.user.findUnique({
          where: { id: cart.user_id },
          select: { email: true, name: true }
        });

        if (!user || !user.email) continue;

        const items = JSON.parse(cart.items);
        const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

        // Criar lista de produtos no carrinho
        const productsList = items
          .map((item: any) => `- ${item.name} (${item.quantity}x) - ${Number(item.price).toLocaleString('pt-AO')} AOA`)
          .join('\n');

        // Enviar email de lembrete
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@kzstore.ao',
          to: user.email,
          subject: `🛒 ${user.name || 'Cliente'}, você deixou produtos no carrinho!`,
          html: `
            <h2>Olá ${user.name || 'Cliente'}! 👋</h2>
            <p>Notamos que você deixou alguns produtos no seu carrinho:</p>
            <pre style="font-family: monospace; background: #f5f5f5; padding: 15px; border-radius: 5px;">
${productsList}
            </pre>
            <p><strong>Total:</strong> ${total.toLocaleString('pt-AO')} AOA</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/#cart" style="
                display: inline-block;
                background: #E31E24;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
              ">
                Finalizar Compra Agora
              </a>
            </p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              KZSTORE - Tech & Electronics | www.kzstore.ao
            </p>
          `
        });

        emails_sent++;
        console.log(`✅ [CRON] Email enviado para ${user.email}`);
      } catch (error: any) {
        console.error(`❌ [CRON] Erro ao processar carrinho ${cart.id}:`, error.message);
      }
    }

    return {
      carts_processed: abandonedCarts.length,
      emails_sent,
      abandoned_carts: abandonedCarts.map(c => ({
        id: c.id,
        user_id: c.user_id,
        created_at: c.created_at,
        items_count: JSON.parse(c.items).length
      }))
    };
  } catch (error) {
    console.error('❌ [CRON] Erro no processamento de carrinhos abandonados:', error);
    throw error;
  }
}

/**
 * CRON JOB 3: Calcular métricas diárias
 * Calcula CLV, conversão e revenue para análise histórica
 * Frequência recomendada: 1x por dia (às 23:59)
 */
export async function calculateDailyMetrics(): Promise<{
  metrics_calculated: string[];
  date: Date;
}> {
  try {
    console.log('📊 [CRON] Calculando métricas diárias...');

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const metrics_calculated: string[] = [];

    // Calcular CLV
    try {
      await calculateCLV({ startDate: startOfDay, endDate: endOfDay });
      metrics_calculated.push('CLV');
      console.log('✅ [CRON] CLV calculado');
    } catch (error: any) {
      console.error('❌ [CRON] Erro ao calcular CLV:', error.message);
    }

    // Calcular taxa de conversão
    try {
      await calculateConversionRate({ startDate: startOfDay, endDate: endOfDay });
      metrics_calculated.push('Conversion Rate');
      console.log('✅ [CRON] Taxa de conversão calculada');
    } catch (error: any) {
      console.error('❌ [CRON] Erro ao calcular conversão:', error.message);
    }

    // Calcular receita
    try {
      await calculateRevenue({ startDate: startOfDay, endDate: endOfDay });
      metrics_calculated.push('Revenue');
      console.log('✅ [CRON] Receita calculada');
    } catch (error: any) {
      console.error('❌ [CRON] Erro ao calcular receita:', error.message);
    }

    console.log(`✅ [CRON] ${metrics_calculated.length} métricas calculadas com sucesso`);

    return {
      metrics_calculated,
      date: new Date()
    };
  } catch (error) {
    console.error('❌ [CRON] Erro no cálculo de métricas diárias:', error);
    throw error;
  }
}

/**
 * CRON JOB 4: Limpar carrinhos antigos
 * Remove carrinhos inativos há mais de 30 dias
 * Frequência recomendada: 1x por dia (às 02:00)
 */
export async function cleanupOldCarts(): Promise<{
  deleted_carts: number;
}> {
  try {
    console.log('🧹 [CRON] Limpando carrinhos antigos...');

    // Carrinhos com mais de 30 dias de inatividade
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await prisma.cart.deleteMany({
      where: {
        updated_at: { lte: thirtyDaysAgo }
      }
    });

    console.log(`✅ [CRON] ${result.count} carrinhos antigos removidos`);

    return {
      deleted_carts: result.count
    };
  } catch (error) {
    console.error('❌ [CRON] Erro na limpeza de carrinhos:', error);
    throw error;
  }
}

/**
 * CRON JOB 5: Atualizar produtos em destaque
 * Marca automaticamente produtos mais vendidos como destaque
 * Frequência recomendada: 1x por semana (Domingo às 00:00)
 */
export async function updateFeaturedProducts(): Promise<{
  featured_updated: number;
  top_products: any[];
}> {
  try {
    console.log('⭐ [CRON] Atualizando produtos em destaque...');

    // Buscar pedidos dos últimos 30 dias
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentOrders = await prisma.order.findMany({
      where: {
        created_at: { gte: thirtyDaysAgo },
        status: { in: ['pago', 'enviado', 'entregue'] }
      },
      select: { items: true }
    });

    // Contar vendas por produto
    const productSales = new Map<string, number>();

    for (const order of recentOrders) {
      const items = JSON.parse(order.items);
      for (const item of items) {
        const productId = item.product_id;
        productSales.set(productId, (productSales.get(productId) || 0) + item.quantity);
      }
    }

    // Ordenar por vendas e pegar top 10
    const topProducts = Array.from(productSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, sales]) => ({ id, sales }));

    console.log(`📊 [CRON] Top 10 produtos mais vendidos identificados`);

    // Remover destaque de todos os produtos
    await prisma.product.updateMany({
      where: { destaque: true },
      data: { destaque: false }
    });

    // Marcar top 10 como destaque
    let featured_updated = 0;
    for (const { id } of topProducts) {
      await prisma.product.update({
        where: { id },
        data: { destaque: true }
      });
      featured_updated++;
    }

    console.log(`✅ [CRON] ${featured_updated} produtos marcados como destaque`);

    return {
      featured_updated,
      top_products: topProducts
    };
  } catch (error) {
    console.error('❌ [CRON] Erro ao atualizar produtos em destaque:', error);
    throw error;
  }
}

/**
 * CRON JOB 6: Enviar relatório semanal
 * Envia resumo semanal de vendas e métricas para administradores
 * Frequência recomendada: 1x por semana (Segunda às 09:00)
 */
export async function sendWeeklyReport(): Promise<{
  report_sent: boolean;
  emails_sent: number;
}> {
  try {
    console.log('📧 [CRON] Gerando relatório semanal...');

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Estatísticas da semana
    const [totalOrders, totalRevenue, newUsers, totalProducts] = await Promise.all([
      prisma.order.count({
        where: { created_at: { gte: sevenDaysAgo } }
      }),
      prisma.order.aggregate({
        where: {
          created_at: { gte: sevenDaysAgo },
          status: { in: ['pago', 'enviado', 'entregue'] }
        },
        _sum: { total: true }
      }),
      prisma.user.count({
        where: {
          created_at: { gte: sevenDaysAgo },
          role: 'customer'
        }
      }),
      prisma.product.count({ where: { ativo: true } })
    ]);

    const revenue = Number(totalRevenue._sum.total || 0);

    // Buscar produto mais vendido da semana
    const weekOrders = await prisma.order.findMany({
      where: {
        created_at: { gte: sevenDaysAgo },
        status: { in: ['pago', 'enviado', 'entregue'] }
      },
      select: { items: true }
    });

    const productSales = new Map<string, { name: string; sales: number }>();

    for (const order of weekOrders) {
      const items = JSON.parse(order.items);
      for (const item of items) {
        const current = productSales.get(item.product_id) || { name: item.name, sales: 0 };
        current.sales += item.quantity;
        productSales.set(item.product_id, current);
      }
    }

    const topProduct = Array.from(productSales.values())
      .sort((a, b) => b.sales - a.sales)[0] || { name: 'N/A', sales: 0 };

    // Enviar email
    const adminEmails = process.env.ADMIN_NOTIFICATION_EMAILS?.split(',') || [];
    let emails_sent = 0;

    const reportHtml = `
      <h2>📊 Relatório Semanal KZSTORE</h2>
      <p><strong>Período:</strong> ${sevenDaysAgo.toLocaleDateString('pt-AO')} - ${new Date().toLocaleDateString('pt-AO')}</p>

      <h3>Resumo de Vendas</h3>
      <ul>
        <li><strong>Total de Pedidos:</strong> ${totalOrders}</li>
        <li><strong>Receita Total:</strong> ${revenue.toLocaleString('pt-AO')} AOA</li>
        <li><strong>Ticket Médio:</strong> ${totalOrders > 0 ? (revenue / totalOrders).toLocaleString('pt-AO') : 0} AOA</li>
      </ul>

      <h3>Clientes e Produtos</h3>
      <ul>
        <li><strong>Novos Clientes:</strong> ${newUsers}</li>
        <li><strong>Produtos Ativos:</strong> ${totalProducts}</li>
        <li><strong>Produto Mais Vendido:</strong> ${topProduct.name} (${topProduct.sales} unidades)</li>
      </ul>

      <hr>
      <p style="color: #666; font-size: 12px;">
        KZSTORE - Tech & Electronics | Relatório Automático Semanal
      </p>
    `;

    for (const email of adminEmails) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@kzstore.ao',
          to: email.trim(),
          subject: `📊 KZSTORE - Relatório Semanal`,
          html: reportHtml
        });
        emails_sent++;
        console.log(`✅ [CRON] Relatório enviado para ${email}`);
      } catch (error: any) {
        console.error(`❌ [CRON] Erro ao enviar email para ${email}:`, error.message);
      }
    }

    return {
      report_sent: emails_sent > 0,
      emails_sent
    };
  } catch (error) {
    console.error('❌ [CRON] Erro ao gerar relatório semanal:', error);
    throw error;
  }
}
