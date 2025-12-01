// Email Service for KZSTORE
// Using Resend API for email delivery

type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

type OrderEmailData = {
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  items: Array<{
    product_nome: string;
    quantity: number;
    preco_aoa: number;
  }>;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  tracking_code?: string;
};

// Email Templates
export function getOrderConfirmationTemplate(data: OrderEmailData): EmailTemplate {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">
        <strong>${item.product_nome}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center;">
        ${item.quantity}x
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">
        ${(item.preco_aoa * item.quantity).toLocaleString('pt-AO')} AOA
      </td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pedido Confirmado - KZSTORE</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F3F4F6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #E31E24 0%, #C41E1E 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 28px;">
                🎉 Pedido Confirmado!
              </h1>
              <p style="margin: 10px 0 0 0; color: #FDD835; font-size: 16px;">
                KZSTORE - Tech & Electronics
              </p>
            </td>
          </tr>

          <!-- Order ID -->
          <tr>
            <td style="padding: 30px 30px 20px 30px; text-align: center; background-color: #FEF3C7; border-bottom: 2px solid #FDD835;">
              <p style="margin: 0; color: #92400E; font-size: 14px;">Número do Pedido</p>
              <h2 style="margin: 5px 0 0 0; color: #E31E24; font-size: 32px; font-weight: bold;">
                #${data.order_id}
              </h2>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong>${data.customer_name}</strong>,
              </p>
              <p style="margin: 15px 0 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Recebemos o seu pedido com sucesso! Estamos a preparar os seus produtos com todo o cuidado.
              </p>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #1F2937; font-size: 18px;">
                📦 Itens do Pedido
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #F9FAFB;">
                    <th style="padding: 12px; text-align: left; color: #6B7280; font-size: 12px; text-transform: uppercase;">Produto</th>
                    <th style="padding: 12px; text-align: center; color: #6B7280; font-size: 12px; text-transform: uppercase;">Qtd</th>
                    <th style="padding: 12px; text-align: right; color: #6B7280; font-size: 12px; text-transform: uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr style="background-color: #F9FAFB;">
                    <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold; color: #1F2937;">
                      TOTAL:
                    </td>
                    <td style="padding: 15px; text-align: right; font-weight: bold; color: #E31E24; font-size: 20px;">
                      ${data.total.toLocaleString('pt-AO')} AOA
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Delivery Info -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px 0; color: #1E40AF; font-size: 16px;">
                      📍 Endereço de Entrega
                    </h3>
                    <p style="margin: 0; color: #1F2937; line-height: 1.6;">
                      ${data.customer_address}<br>
                      ${data.customer_city}<br>
                      ${data.customer_phone}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Method -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 16px;">
                      💳 Método de Pagamento
                    </h3>
                    <p style="margin: 0; color: #1F2937; font-size: 16px; font-weight: bold;">
                      ${data.payment_method}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #FEF3C7; border-left: 4px solid #FDD835; padding: 15px; border-radius: 4px;">
                <h4 style="margin: 0 0 10px 0; color: #92400E; font-size: 14px;">
                  ⏭️ Próximos Passos
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: #78350F; line-height: 1.8;">
                  <li>Confirme o pagamento conforme o método escolhido</li>
                  <li>Receberá um email quando o pagamento for confirmado</li>
                  <li>Acompanhe o status do seu pedido na área "Meus Pedidos"</li>
                  <li>Entregaremos em 2-5 dias úteis após confirmação</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <a href="https://kzstore.ao" style="display: inline-block; background-color: #E31E24; color: #FFFFFF; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Acompanhar Pedido
              </a>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <p style="margin: 0; color: #6B7280; font-size: 14px;">
                Precisa de ajuda?<br>
                <a href="https://wa.me/244931054015" style="color: #E31E24; text-decoration: none; font-weight: bold;">
                  💬 Fale connosco via WhatsApp
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 14px;">
                <strong>KZSTORE - KwanzaStore</strong><br>
                Tech & Electronics | Luanda, Angola
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                📞 +244 931 054 015 | 📧 info@kzstore.ao<br>
                Segunda - Sábado: 8h - 18h
              </p>
              <p style="margin: 15px 0 0 0; color: #9CA3AF; font-size: 11px;">
                © ${new Date().getFullYear()} KZSTORE. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
KZSTORE - Pedido Confirmado!

Olá ${data.customer_name},

Recebemos o seu pedido #${data.order_id} com sucesso!

ITENS DO PEDIDO:
${data.items.map(item => 
  `- ${item.product_nome} (${item.quantity}x) - ${(item.preco_aoa * item.quantity).toLocaleString('pt-AO')} AOA`
).join('\n')}

TOTAL: ${data.total.toLocaleString('pt-AO')} AOA

ENDEREÇO DE ENTREGA:
${data.customer_address}
${data.customer_city}
${data.customer_phone}

MÉTODO DE PAGAMENTO: ${data.payment_method}

PRÓXIMOS PASSOS:
1. Confirme o pagamento conforme o método escolhido
2. Receberá um email quando o pagamento for confirmado
3. Acompanhe o status na área "Meus Pedidos"
4. Entregaremos em 2-5 dias úteis após confirmação

Precisa de ajuda? Fale connosco via WhatsApp: +244 931 054 015

KZSTORE - Tech & Electronics
Luanda, Angola
`;

  return {
    subject: `✅ Pedido #${data.order_id} Confirmado - KZSTORE`,
    html,
    text
  };
}

export function getStatusUpdateTemplate(data: OrderEmailData): EmailTemplate {
  const statusEmojis: Record<string, string> = {
    'Pendente': '⏳',
    'Pago': '✅',
    'Em Processamento': '📦',
    'Enviado': '🚚',
    'Entregue': '🎉',
    'Cancelado': '❌'
  };

  const statusMessages: Record<string, string> = {
    'Pendente': 'O seu pedido está aguardando confirmação de pagamento.',
    'Pago': 'O pagamento foi confirmado! Estamos a preparar o seu pedido.',
    'Em Processamento': 'O seu pedido está sendo preparado com cuidado.',
    'Enviado': 'O seu pedido foi enviado e está a caminho!',
    'Entregue': 'O seu pedido foi entregue com sucesso! Obrigado pela preferência.',
    'Cancelado': 'O seu pedido foi cancelado.'
  };

  const emoji = statusEmojis[data.status] || '📋';
  const message = statusMessages[data.status] || 'O status do seu pedido foi atualizado.';

  const html = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atualização de Pedido - KZSTORE</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F3F4F6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #E31E24 0%, #C41E1E 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 28px;">
                ${emoji} Atualização do Pedido
              </h1>
              <p style="margin: 10px 0 0 0; color: #FDD835; font-size: 16px;">
                Pedido #${data.order_id}
              </p>
            </td>
          </tr>

          <!-- Status Badge -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <div style="display: inline-block; background-color: #FEF3C7; border: 2px solid #FDD835; border-radius: 50px; padding: 15px 30px;">
                <p style="margin: 0; color: #92400E; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  Status Atual
                </p>
                <h2 style="margin: 5px 0 0 0; color: #E31E24; font-size: 24px; font-weight: bold;">
                  ${data.status}
                </h2>
              </div>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
                Olá <strong>${data.customer_name}</strong>,
              </p>
              <p style="margin: 15px 0 0 0; color: #374151; font-size: 18px; line-height: 1.6; text-align: center; font-weight: 500;">
                ${message}
              </p>
            </td>
          </tr>

          ${data.tracking_code ? `
          <!-- Tracking Code -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #DBEAFE; border: 2px solid #3B82F6; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="text-align: center;">
                    <h3 style="margin: 0 0 10px 0; color: #1E40AF; font-size: 16px;">
                      🚚 Código de Rastreamento
                    </h3>
                    <p style="margin: 0; color: #1F2937; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
                      ${data.tracking_code}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Order Summary -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #1F2937; font-size: 16px;">
                📦 Resumo do Pedido
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px;">
                <tr>
                  <td style="padding: 8px 0; color: #6B7280;">Número do Pedido:</td>
                  <td style="padding: 8px 0; text-align: right; color: #1F2937; font-weight: bold;">#${data.order_id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280;">Total:</td>
                  <td style="padding: 8px 0; text-align: right; color: #E31E24; font-weight: bold; font-size: 18px;">${data.total.toLocaleString('pt-AO')} AOA</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280;">Itens:</td>
                  <td style="padding: 8px 0; text-align: right; color: #1F2937;">${data.items.length} produto(s)</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <a href="https://kzstore.ao" style="display: inline-block; background-color: #E31E24; color: #FFFFFF; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Ver Detalhes do Pedido
              </a>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <p style="margin: 0; color: #6B7280; font-size: 14px;">
                Dúvidas sobre o seu pedido?<br>
                <a href="https://wa.me/244931054015" style="color: #E31E24; text-decoration: none; font-weight: bold;">
                  💬 Fale connosco via WhatsApp
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 14px;">
                <strong>KZSTORE - KwanzaStore</strong><br>
                Tech & Electronics | Luanda, Angola
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                📞 +244 931 054 015 | 📧 info@kzstore.ao<br>
                Segunda - Sábado: 8h - 18h
              </p>
              <p style="margin: 15px 0 0 0; color: #9CA3AF; font-size: 11px;">
                © ${new Date().getFullYear()} KZSTORE. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
KZSTORE - Atualização do Pedido #${data.order_id}

${emoji} Status: ${data.status}

Olá ${data.customer_name},

${message}

${data.tracking_code ? `
CÓDIGO DE RASTREAMENTO: ${data.tracking_code}
` : ''}

RESUMO DO PEDIDO:
- Número: #${data.order_id}
- Total: ${data.total.toLocaleString('pt-AO')} AOA
- Itens: ${data.items.length} produto(s)

Acompanhe o seu pedido em: https://kzstore.ao

Dúvidas? Fale connosco via WhatsApp: +244 931 054 015

KZSTORE - Tech & Electronics
`;

  return {
    subject: `${emoji} Pedido #${data.order_id} - ${data.status} - KZSTORE`,
    html,
    text
  };
}

// Send email using Resend API
export async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not configured, email not sent');
      console.log('📧 Email preview:', {
        to,
        subject: template.subject,
        text_preview: template.text.substring(0, 200)
      });
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Use Resend sandbox email (works without domain verification)
        // To use custom domain, verify kzstore.ao at https://resend.com/domains
        from: 'KZSTORE <onboarding@resend.dev>',
        to: [to],
        subject: template.subject,
        html: template.html,
        text: template.text,
        // Add reply-to for customer responses
        reply_to: 'contato@kzstore.ao'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Resend API error:', JSON.stringify(errorData));
      console.log('💡 Dica: Para usar pedidos@kzstore.ao, verifique o domínio em https://resend.com/domains');
      console.log('📧 Por enquanto, usando onboarding@resend.dev (sandbox)');
      return false;
    }

    const data = await response.json();
    console.log('✅ Email sent successfully:', data.id);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

// Send WhatsApp notification (using WhatsApp Business API or Twilio)
export async function sendWhatsAppNotification(
  phone: string,
  orderData: OrderEmailData
): Promise<boolean> {
  try {
    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    
    const statusEmojis: Record<string, string> = {
      'Pendente': '⏳',
      'Pago': '✅',
      'Em Processamento': '📦',
      'Enviado': '🚚',
      'Entregue': '🎉',
      'Cancelado': '❌'
    };

    const emoji = statusEmojis[orderData.status] || '📋';
    
    let message = `*KZSTORE* ${emoji}\n\n`;
    
    if (orderData.status === 'Pendente') {
      message += `Olá *${orderData.customer_name}*! 👋\n\n`;
      message += `O seu pedido *#${orderData.order_id}* foi confirmado com sucesso!\n\n`;
      message += `*Total:* ${orderData.total.toLocaleString('pt-AO')} AOA\n`;
      message += `*Pagamento:* ${orderData.payment_method}\n\n`;
      message += `📦 *${orderData.items.length} item(s):*\n`;
      orderData.items.forEach(item => {
        message += `- ${item.product_nome} (${item.quantity}x)\n`;
      });
      message += `\nAssim que confirmarmos o pagamento, iniciaremos a preparação do seu pedido.\n\n`;
    } else {
      message += `Olá *${orderData.customer_name}*!\n\n`;
      message += `O seu pedido *#${orderData.order_id}* foi atualizado:\n\n`;
      message += `*Status:* ${orderData.status} ${emoji}\n\n`;
      
      if (orderData.tracking_code) {
        message += `*Código de Rastreio:* ${orderData.tracking_code}\n\n`;
      }
      
      if (orderData.status === 'Enviado') {
        message += `O seu pedido está a caminho! 🚚\n\n`;
      } else if (orderData.status === 'Entregue') {
        message += `O seu pedido foi entregue! Obrigado pela preferência. 🎉\n\n`;
      }
    }
    
    message += `Precisa de ajuda? Responda esta mensagem! 💬`;

    // Log the message (actual WhatsApp API integration would go here)
    console.log('📱 WhatsApp notification prepared for:', cleanPhone);
    console.log('📝 Message:', message);
    
    // TODO: Integrate with WhatsApp Business API or Twilio
    // For now, we'll just log it
    
    return true;
  } catch (error) {
    console.error('❌ Error sending WhatsApp notification:', error);
    return false;
  }
}