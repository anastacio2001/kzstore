// KZSTORE - Integração Twilio
// Endpoints para autenticação OTP, recuperação de carrinho e notificações

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';

const app = new Hono();
app.use('*', cors());

// Configurações Twilio
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
const TWILIO_VERIFY_SERVICE_SID = Deno.env.get('TWILIO_VERIFY_SERVICE_SID') || '';
const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER') || 'whatsapp:+14155238886';

// Função auxiliar para chamar API Twilio
async function twilioRequest(endpoint: string, method: string, body?: any) {
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  
  const formBody = body 
    ? Object.keys(body)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(body[key]))
        .join('&')
    : '';

  const response = await fetch(`https://api.twilio.com/2010-04-01${endpoint}`, {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: method === 'POST' ? formBody : undefined,
  });

  return response.json();
}

// 🔐 Endpoint 1: Enviar código OTP via WhatsApp/SMS
app.post('/send-otp', async (c) => {
  try {
    const { phone } = await c.req.json();

    if (!phone) {
      return c.json({ success: false, error: 'Telefone é obrigatório' }, 400);
    }

    // Formatar telefone no padrão internacional
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    // Tentar enviar via WhatsApp primeiro
    try {
      const verification = await twilioRequest(
        `/Accounts/${TWILIO_ACCOUNT_SID}/Verify/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications.json`,
        'POST',
        {
          To: formattedPhone,
          Channel: 'whatsapp'
        }
      );

      if (verification.status === 'pending') {
        return c.json({
          success: true,
          channel: 'whatsapp',
          status: verification.status,
          message: 'Código enviado via WhatsApp'
        });
      }
    } catch (whatsappError) {
      console.error('WhatsApp OTP failed, trying SMS:', whatsappError);
    }

    // Fallback para SMS se WhatsApp falhar
    const verification = await twilioRequest(
      `/Accounts/${TWILIO_ACCOUNT_SID}/Verify/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications.json`,
      'POST',
      {
        To: formattedPhone,
        Channel: 'sms'
      }
    );

    if (verification.status === 'pending') {
      return c.json({
        success: true,
        channel: 'sms',
        status: verification.status,
        message: 'Código enviado via SMS'
      });
    }

    return c.json({
      success: false,
      error: 'Erro ao enviar código de verificação'
    }, 500);

  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao enviar código'
    }, 500);
  }
});

// ✅ Endpoint 2: Verificar código OTP
app.post('/verify-otp', async (c) => {
  try {
    const { phone, code } = await c.req.json();

    if (!phone || !code) {
      return c.json({ success: false, error: 'Telefone e código são obrigatórios' }, 400);
    }

    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    const verification = await twilioRequest(
      `/Accounts/${TWILIO_ACCOUNT_SID}/Verify/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck.json`,
      'POST',
      {
        To: formattedPhone,
        Code: code
      }
    );

    if (verification.status === 'approved') {
      return c.json({
        success: true,
        status: verification.status,
        message: 'Código verificado com sucesso'
      });
    }

    return c.json({
      success: false,
      error: 'Código inválido ou expirado'
    }, 400);

  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao verificar código'
    }, 500);
  }
});

// 🛒 Endpoint 3: Enviar notificação de carrinho abandonado
app.post('/cart-recovery', async (c) => {
  try {
    const { phone, customerName, items, cartTotal, cartId } = await c.req.json();

    if (!phone || !items) {
      return c.json({ success: false, error: 'Dados incompletos' }, 400);
    }

    const formattedPhone = phone.startsWith('whatsapp:') ? phone : `whatsapp:+${phone.replace(/\D/g, '')}`;
    
    // Mensagem personalizada
    let message = `Olá ${customerName || 'Cliente'}! 👋\n\n`;
    message += `Notamos que você deixou alguns produtos no carrinho:\n\n`;
    
    items.slice(0, 3).forEach((item: any, index: number) => {
      message += `${index + 1}. ${item.nome} (${item.quantidade}x)\n`;
    });
    
    if (items.length > 3) {
      message += `... e mais ${items.length - 3} produtos\n`;
    }
    
    message += `\n💰 Total: ${cartTotal?.toLocaleString('pt-AO')} AOA\n\n`;
    message += `🎁 *Finalize agora e ganhe 10% de desconto!*\n\n`;
    message += `Clique aqui para continuar: https://kzstore.ao/carrinho/${cartId}`;

    const result = await twilioRequest(
      `/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      'POST',
      {
        From: TWILIO_WHATSAPP_NUMBER,
        To: formattedPhone,
        Body: message
      }
    );

    if (result.sid) {
      return c.json({
        success: true,
        messageSid: result.sid,
        message: 'Notificação de carrinho enviada'
      });
    }

    return c.json({
      success: false,
      error: 'Erro ao enviar mensagem'
    }, 500);

  } catch (error: any) {
    console.error('Error sending cart recovery:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao enviar notificação'
    }, 500);
  }
});

// 📦 Endpoint 4: Notificação de status do pedido
app.post('/order-notification', async (c) => {
  try {
    const { phone, orderNumber, status, customerName } = await c.req.json();

    if (!phone || !orderNumber || !status) {
      return c.json({ success: false, error: 'Dados incompletos' }, 400);
    }

    const formattedPhone = phone.startsWith('whatsapp:') ? phone : `whatsapp:+${phone.replace(/\D/g, '')}`;
    
    // Mensagens por status
    const statusMessages: Record<string, string> = {
      'pending': `Olá ${customerName}! Seu pedido #${orderNumber} foi recebido e está aguardando pagamento. 💳`,
      'confirmed': `✅ Pagamento confirmado! Pedido #${orderNumber} está sendo preparado.`,
      'shipped': `📦 Seu pedido #${orderNumber} foi enviado e está a caminho!`,
      'delivered': `🎉 Pedido #${orderNumber} entregue! Obrigado por comprar na KZSTORE!`,
      'cancelled': `❌ Pedido #${orderNumber} foi cancelado. Entre em contato para mais informações.`
    };

    const message = statusMessages[status] || `Status do pedido #${orderNumber} atualizado.`;

    const result = await twilioRequest(
      `/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      'POST',
      {
        From: TWILIO_WHATSAPP_NUMBER,
        To: formattedPhone,
        Body: message
      }
    );

    if (result.sid) {
      return c.json({
        success: true,
        messageSid: result.sid,
        message: 'Notificação enviada'
      });
    }

    return c.json({
      success: false,
      error: 'Erro ao enviar mensagem'
    }, 500);

  } catch (error: any) {
    console.error('Error sending order notification:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao enviar notificação'
    }, 500);
  }
});

// 📞 Endpoint 5: Mensagem de boas-vindas (novo cliente)
app.post('/welcome-message', async (c) => {
  try {
    const { phone, customerName } = await c.req.json();

    if (!phone) {
      return c.json({ success: false, error: 'Telefone é obrigatório' }, 400);
    }

    const formattedPhone = phone.startsWith('whatsapp:') ? phone : `whatsapp:+${phone.replace(/\D/g, '')}`;
    
    const message = `Bem-vindo à KZSTORE, ${customerName}! 🎉\n\n` +
      `Obrigado por se cadastrar. Você agora tem acesso a:\n\n` +
      `✅ Produtos exclusivos\n` +
      `✅ Ofertas especiais\n` +
      `✅ Atendimento prioritário\n` +
      `✅ Rastreamento de pedidos\n\n` +
      `Explore nosso catálogo: https://kzstore.ao`;

    const result = await twilioRequest(
      `/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      'POST',
      {
        From: TWILIO_WHATSAPP_NUMBER,
        To: formattedPhone,
        Body: message
      }
    );

    if (result.sid) {
      return c.json({
        success: true,
        messageSid: result.sid,
        message: 'Mensagem de boas-vindas enviada'
      });
    }

    return c.json({
      success: false,
      error: 'Erro ao enviar mensagem'
    }, 500);

  } catch (error: any) {
    console.error('Error sending welcome message:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao enviar mensagem'
    }, 500);
  }
});

// 🆘 Endpoint 6: Status da configuração Twilio
app.get('/status', (c) => {
  const isConfigured = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_VERIFY_SERVICE_SID);
  
  return c.json({
    configured: isConfigured,
    services: {
      otp: isConfigured,
      messaging: isConfigured,
      whatsapp: !!TWILIO_WHATSAPP_NUMBER
    },
    message: isConfigured 
      ? 'Twilio configurado e pronto para uso' 
      : 'Configure as variáveis de ambiente Twilio'
  });
});

export default app;
