import { PrismaClient } from '@prisma/client';
import { sendEmail } from './mailer';

const prisma = new PrismaClient();

/**
 * Verifica todos os produtos e cria alertas para stock baixo
 * Deve ser executado periodicamente (cron job ou agendador)
 */
export async function checkLowStockAndAlert() {
  try {
    console.log('🔍 [LOW STOCK] Verificando produtos com stock baixo...');

    // Buscar produtos com stock abaixo do mínimo
    const lowStockProducts = await prisma.product.findMany({
      where: {
        ativo: true,
        estoque: {
          lte: prisma.raw('estoque_minimo') // estoque <= estoque_minimo
        }
      },
      select: {
        id: true,
        nome: true,
        estoque: true,
        estoque_minimo: true,
        sku: true
      }
    });

    console.log(`📊 [LOW STOCK] Encontrados ${lowStockProducts.length} produtos com stock baixo`);

    const alerts = [];

    for (const product of lowStockProducts) {
      // Verificar se já existe alerta pendente para este produto
      const existingAlert = await prisma.lowStockAlert.findFirst({
        where: {
          product_id: product.id,
          status: 'pending'
        }
      });

      if (!existingAlert) {
        // Criar novo alerta
        const alert = await prisma.lowStockAlert.create({
          data: {
            product_id: product.id,
            product_name: product.nome,
            current_stock: product.estoque,
            minimum_stock: product.estoque_minimo,
            threshold_level: product.estoque_minimo,
            status: 'pending'
          }
        });

        alerts.push(alert);
        console.log(`⚠️  [LOW STOCK] Alerta criado para: ${product.nome} (Stock: ${product.estoque}/${product.estoque_minimo})`);
      }
    }

    // Enviar email de notificação se houver alertas novos
    if (alerts.length > 0) {
      await sendLowStockNotificationEmail(alerts);
    }

    return { success: true, alertsCreated: alerts.length, totalLowStock: lowStockProducts.length };
  } catch (error) {
    console.error('❌ [LOW STOCK] Erro ao verificar stock:', error);
    throw error;
  }
}

/**
 * Envia email de notificação para administradores sobre stock baixo
 */
async function sendLowStockNotificationEmail(alerts: any[]) {
  try {
    // Email para administradores (configurar emails no .env)
    const adminEmails = process.env.ADMIN_NOTIFICATION_EMAILS?.split(',') || ['admin@kzstore.ao'];

    const alertsHtml = alerts.map(alert => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${alert.product_name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; color: #d32f2f; font-weight: bold;">${alert.current_stock}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${alert.minimum_stock}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
          th { background: #f5f5f5; padding: 10px; text-align: left; border: 1px solid #ddd; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚠️ Alerta de Stock Baixo - KZSTORE</h2>
          </div>
          <div class="content">
            <p><strong>${alerts.length} produto(s)</strong> estão com stock abaixo do mínimo configurado:</p>

            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Stock Atual</th>
                  <th>Stock Mínimo</th>
                </tr>
              </thead>
              <tbody>
                ${alertsHtml}
              </tbody>
            </table>

            <p style="margin-top: 20px;">
              <strong>Ação recomendada:</strong> Verifique o estoque e faça o reabastecimento dos produtos listados.
            </p>

            <p style="margin-top: 10px;">
              <a href="${process.env.ADMIN_PANEL_URL || 'https://kzstore.ao/admin'}/inventory"
                 style="display: inline-block; background: #E31E24; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Ver Painel de Inventário
              </a>
            </p>
          </div>
          <div class="footer">
            <p>KZSTORE - Tech & Electronics<br>
            Email automático - Não responder</p>
          </div>
        </div>
      </body>
      </html>
    `;

    for (const email of adminEmails) {
      await sendEmail({
        to: email.trim(),
        subject: `⚠️ Alerta: ${alerts.length} produto(s) com stock baixo`,
        html: emailHtml
      });
    }

    console.log(`📧 [LOW STOCK] Emails de notificação enviados para ${adminEmails.length} administrador(es)`);
  } catch (error) {
    console.error('❌ [LOW STOCK] Erro ao enviar email de notificação:', error);
  }
}

/**
 * Resolve um alerta de stock baixo (quando o stock foi reabastecido)
 */
export async function resolveLowStockAlert(alertId: string, notes?: string) {
  try {
    const alert = await prisma.lowStockAlert.update({
      where: { id: alertId },
      data: {
        status: 'resolved',
        resolved_at: new Date(),
        notes: notes || 'Stock reabastecido'
      }
    });

    console.log(`✅ [LOW STOCK] Alerta resolvido: ${alert.product_name}`);
    return alert;
  } catch (error) {
    console.error('❌ [LOW STOCK] Erro ao resolver alerta:', error);
    throw error;
  }
}

/**
 * Auto-resolve alertas quando o produto tem stock acima do mínimo
 */
export async function autoResolveAlerts() {
  try {
    const pendingAlerts = await prisma.lowStockAlert.findMany({
      where: { status: 'pending' }
    });

    let resolved = 0;

    for (const alert of pendingAlerts) {
      const product = await prisma.product.findUnique({
        where: { id: alert.product_id },
        select: { estoque: true, estoque_minimo: true }
      });

      if (product && product.estoque > product.estoque_minimo) {
        await prisma.lowStockAlert.update({
          where: { id: alert.id },
          data: {
            status: 'resolved',
            resolved_at: new Date(),
            notes: 'Auto-resolvido: stock reabastecido'
          }
        });
        resolved++;
      }
    }

    console.log(`✅ [LOW STOCK] ${resolved} alerta(s) auto-resolvido(s)`);
    return { resolved };
  } catch (error) {
    console.error('❌ [LOW STOCK] Erro ao auto-resolver alertas:', error);
    throw error;
  }
}
