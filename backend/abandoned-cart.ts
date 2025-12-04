import { PrismaClient } from '@prisma/client';
import { sendEmail } from './mailer';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Rastreia carrinho como potencialmente abandonado
 * Deve ser chamado quando o usuário adiciona items ao carrinho
 */
export async function trackCart(data: {
  user_email: string;
  user_name?: string;
  user_id?: string;
  cart_items: any[];
  cart_total: number;
}) {
  try {
    // Verificar se já existe um carrinho abandonado para este email
    const existing = await prisma.abandonedCart.findFirst({
      where: {
        user_email: data.user_email,
        status: 'abandoned'
      }
    });

    if (existing) {
      // Atualizar carrinho existente
      return await prisma.abandonedCart.update({
        where: { id: existing.id },
        data: {
          cart_items: data.cart_items,
          cart_total: data.cart_total,
          abandoned_at: new Date() // Reset timer
        }
      });
    } else {
      // Criar novo registro
      return await prisma.abandonedCart.create({
        data: {
          user_id: data.user_id,
          user_email: data.user_email,
          user_name: data.user_name,
          cart_items: data.cart_items,
          cart_total: data.cart_total,
          abandoned_at: new Date(),
          recovery_token: crypto.randomBytes(32).toString('hex')
        }
      });
    }
  } catch (error) {
    console.error('❌ [ABANDONED CART] Erro ao rastrear carrinho:', error);
    throw error;
  }
}

/**
 * Marca carrinho como recuperado quando o pedido é criado
 */
export async function markCartAsRecovered(userEmail: string, orderId: string) {
  try {
    await prisma.abandonedCart.updateMany({
      where: {
        user_email: userEmail,
        status: 'abandoned'
      },
      data: {
        status: 'recovered',
        recovered_at: new Date(),
        recovered_order_id: orderId
      }
    });

    console.log(`✅ [ABANDONED CART] Carrinho recuperado para: ${userEmail}`);
  } catch (error) {
    console.error('❌ [ABANDONED CART] Erro ao marcar carrinho como recuperado:', error);
  }
}

/**
 * Encontra carrinhos abandonados que precisam de email de recuperação
 * Carrinhos com mais de 1 hora sem atividade e menos de 3 lembretes enviados
 */
export async function findCartsForRecovery() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const carts = await prisma.abandonedCart.findMany({
      where: {
        status: 'abandoned',
        abandoned_at: {
          gte: threeDaysAgo, // Não muito antigo (< 3 dias)
          lte: oneHourAgo // Pelo menos 1 hora atrás
        },
        reminder_count: {
          lt: 3 // Máximo 3 lembretes
        },
        OR: [
          { last_reminder_at: null }, // Nunca enviou lembrete
          {
            last_reminder_at: {
              lte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Último lembrete há mais de 24h
            }
          }
        ]
      }
    });

    console.log(`🔍 [ABANDONED CART] Encontrados ${carts.length} carrinho(s) para recuperação`);
    return carts;
  } catch (error) {
    console.error('❌ [ABANDONED CART] Erro ao buscar carrinhos:', error);
    throw error;
  }
}

/**
 * Envia email de recuperação de carrinho abandonado
 */
export async function sendRecoveryEmail(cartId: string) {
  try {
    const cart = await prisma.abandonedCart.findUnique({
      where: { id: cartId }
    });

    if (!cart) {
      throw new Error('Carrinho não encontrado');
    }

    // Calcular desconto progressivo baseado no número de lembretes
    const discounts = [5, 10, 15]; // 5% no 1º, 10% no 2º, 15% no 3º
    const discount = discounts[cart.reminder_count] || 0;

    // Link de recuperação
    const recoveryLink = `${process.env.FRONTEND_URL || 'https://kzstore.ao'}/cart/recover?token=${cart.recovery_token}`;

    // Montar lista de itens
    const cartItems = typeof cart.cart_items === 'string'
      ? JSON.parse(cart.cart_items)
      : cart.cart_items;

    const itemsHtml = Array.isArray(cartItems) ? cartItems.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${item.image || '/placeholder.png'}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br>
          <small>Quantidade: ${item.quantity}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${Number(item.price || 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
        </td>
      </tr>
    `).join('') : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #E31E24 0%, #8B0000 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
          .cart-items { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          .cta-button { display: inline-block; background: #E31E24; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .cta-button:hover { background: #C11A20; }
          .discount-badge { background: #4CAF50; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 10px 0; font-size: 18px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🛒 Olá ${cart.user_name || 'Cliente'}!</h2>
            <p style="margin: 10px 0; font-size: 16px;">Deixou algo no seu carrinho...</p>
          </div>
          <div class="content">
            <p>Notamos que você deixou alguns itens no seu carrinho. Não perca esta oportunidade!</p>

            ${discount > 0 ? `
              <div style="text-align: center; margin: 20px 0;">
                <div class="discount-badge">
                  🎉 ${discount}% DE DESCONTO ESPECIAL
                </div>
                <p style="color: #4CAF50; font-weight: bold;">Use o link abaixo e ganhe desconto exclusivo!</p>
              </div>
            ` : ''}

            <div class="cart-items">
              <h3>Itens no seu carrinho:</h3>
              <table>
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; border-top: 2px solid #E31E24;">
                    TOTAL:
                  </td>
                  <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #E31E24; border-top: 2px solid #E31E24;">
                    ${Number(cart.cart_total).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                  </td>
                </tr>
                ${discount > 0 ? `
                  <tr>
                    <td colspan="2" style="padding: 10px; text-align: right; color: #4CAF50; font-weight: bold;">
                      Desconto (${discount}%):
                    </td>
                    <td style="padding: 10px; text-align: right; color: #4CAF50; font-weight: bold;">
                      -${(Number(cart.cart_total) * discount / 100).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 10px; text-align: right; font-size: 20px; font-weight: bold;">
                      NOVO TOTAL:
                    </td>
                    <td style="padding: 10px; text-align: right; font-size: 20px; font-weight: bold; color: #E31E24;">
                      ${(Number(cart.cart_total) * (1 - discount / 100)).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                    </td>
                  </tr>
                ` : ''}
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${recoveryLink}" class="cta-button">
                ${discount > 0 ? `🎁 FINALIZAR COM ${discount}% OFF` : '🛒 FINALIZAR COMPRA'}
              </a>
            </div>

            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              <strong>Por que escolher a KZSTORE?</strong><br>
              ✓ Entrega rápida em Luanda<br>
              ✓ Produtos originais e garantidos<br>
              ✓ Pagamento seguro<br>
              ✓ Suporte 24/7
            </p>

            ${discount > 0 ? `
              <p style="background: #FFF3CD; padding: 15px; border-radius: 5px; border-left: 4px solid #FFC107; margin-top: 20px;">
                <strong>⏰ Atenção:</strong> Este desconto é válido apenas por 24 horas!
              </p>
            ` : ''}
          </div>
          <div class="footer">
            <p>KZSTORE - Tech & Electronics<br>
            Luanda, Angola<br>
            <a href="${process.env.FRONTEND_URL || 'https://kzstore.ao'}/unsubscribe?email=${cart.user_email}">Cancelar subscrição</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email
    await sendEmail({
      to: cart.user_email,
      subject: discount > 0
        ? `🎁 ${discount}% OFF no seu carrinho - KZSTORE`
        : '🛒 Você esqueceu algo no carrinho - KZSTORE',
      html: emailHtml
    });

    // Atualizar cart com desconto e contadores
    await prisma.abandonedCart.update({
      where: { id: cartId },
      data: {
        last_reminder_at: new Date(),
        reminder_count: cart.reminder_count + 1,
        recovery_discount: discount
      }
    });

    console.log(`📧 [ABANDONED CART] Email de recuperação enviado para: ${cart.user_email} (Desconto: ${discount}%)`);
    return { success: true, discount };
  } catch (error) {
    console.error('❌ [ABANDONED CART] Erro ao enviar email:', error);
    throw error;
  }
}

/**
 * Processa carrinhos abandonados e envia emails de recuperação
 * Deve ser executado periodicamente (a cada hora, por exemplo)
 */
export async function processAbandonedCarts() {
  try {
    console.log('🔄 [ABANDONED CART] Iniciando processamento de carrinhos abandonados...');

    const carts = await findCartsForRecovery();
    let sent = 0;
    let failed = 0;

    for (const cart of carts) {
      try {
        await sendRecoveryEmail(cart.id);
        sent++;
      } catch (error) {
        console.error(`❌ [ABANDONED CART] Falha ao enviar para ${cart.user_email}:`, error);
        failed++;
      }
    }

    console.log(`✅ [ABANDONED CART] Processamento concluído: ${sent} enviados, ${failed} falharam`);
    return { sent, failed, total: carts.length };
  } catch (error) {
    console.error('❌ [ABANDONED CART] Erro no processamento:', error);
    throw error;
  }
}

/**
 * Expira carrinhos muito antigos (>7 dias)
 */
export async function expireOldCarts() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await prisma.abandonedCart.updateMany({
      where: {
        status: 'abandoned',
        abandoned_at: {
          lte: sevenDaysAgo
        }
      },
      data: {
        status: 'expired'
      }
    });

    console.log(`🗑️  [ABANDONED CART] ${result.count} carrinho(s) expirado(s)`);
    return result;
  } catch (error) {
    console.error('❌ [ABANDONED CART] Erro ao expirar carrinhos:', error);
    throw error;
  }
}
