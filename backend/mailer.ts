/**
 * Resend Email Service
 * Serviço de envio de emails transacionais usando Resend
 * Documentação: https://resend.com/docs
 */

import 'dotenv/config';
import { Resend } from 'resend';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  emailId?: string;
}

/**
 * Envia email usando Resend API
 */
export async function sendEmail({ to, subject, html, text }: EmailParams): Promise<EmailResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@kzstore.ao';
  const fromName = process.env.RESEND_FROM_NAME || 'KZSTORE Angola';

  if (!apiKey) {
    console.error('❌ [MAILER] RESEND_API_KEY não configurada');
    return {
      success: false,
      error: 'RESEND_API_KEY não configurada',
    };
  }

  try {
    console.log(`📧 [MAILER] Enviando email para: ${to}`);
    console.log(`📧 [MAILER] Assunto: ${subject}`);

    const resend = new Resend(apiKey);

    const data = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html,
      text: text || undefined,
    });

    if (data.error) {
      console.error('❌ [MAILER] Erro ao enviar email:', data.error);
      return {
        success: false,
        error: data.error.message,
      };
    }

    console.log('✅ [MAILER] Email enviado com sucesso. ID:', data.data?.id);

    return {
      success: true,
      message: 'Email enviado com sucesso',
      emailId: data.data?.id,
    };
  } catch (error) {
    console.error('❌ [MAILER] Erro ao enviar email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Template de email para confirmação de pedido
 */
export function generateOrderConfirmationEmail(orderData: {
  orderId: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  shippingAddress: string;
}): string {
  const { orderId, customerName, items, total, shippingAddress } = orderData;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .item { border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between; }
    .total { font-size: 20px; font-weight: bold; color: #667eea; margin-top: 20px; text-align: right; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Pedido Confirmado!</h1>
      <p>Obrigado pela sua compra, ${customerName}!</p>
    </div>
    
    <div class="content">
      <h2>Detalhes do Pedido #${orderId}</h2>
      
      <div class="order-details">
        <h3>📦 Produtos:</h3>
        ${items
          .map(
            (item) => `
          <div class="item">
            <span>${item.name} (x${item.quantity})</span>
            <span>${item.price.toLocaleString('pt-AO')} Kz</span>
          </div>
        `
          )
          .join('')}
        
        <div class="total">
          Total: ${total.toLocaleString('pt-AO')} Kz
        </div>
      </div>
      
      <div class="order-details">
        <h3>🚚 Endereço de Entrega:</h3>
        <p style="line-height: 1.8;">${shippingAddress}</p>
      </div>
      
      <p><strong>O que acontece agora?</strong></p>
      <ul>
        <li>✅ Seu pedido foi confirmado</li>
        <li>📱 Você receberá atualizações via WhatsApp</li>
        <li>🚚 Prepararemos seu pedido para envio</li>
        <li>📦 Você será notificado quando for enviado</li>
      </ul>
      
      <center>
        <a href="http://localhost:3000#my-orders" class="button">Ver Meu Pedido</a>
      </center>
      
      <div class="footer">
        <p><strong>KZSTORE Angola</strong></p>
        <p>WhatsApp: +244 931 054 015</p>
        <p>Email: suporte@kzstore.ao</p>
        <p>www.kzstore.ao</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Template de email para reset de senha
 */
export function generatePasswordResetEmail(data: {
  customerName: string;
  resetLink: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Reset de Senha</h1>
    </div>
    
    <div class="content">
      <p>Olá ${data.customerName},</p>
      
      <p>Você solicitou o reset da sua senha na KZSTORE.</p>
      
      <center>
        <a href="${data.resetLink}" class="button">Redefinir Senha</a>
      </center>
      
      <div class="warning">
        <strong>⚠️ Importante:</strong>
        <ul>
          <li>Este link expira em 1 hora</li>
          <li>Se você não solicitou este reset, ignore este email</li>
          <li>Nunca compartilhe este link com ninguém</li>
        </ul>
      </div>
      
      <div class="footer">
        <p><strong>KZSTORE Angola</strong></p>
        <p>www.kzstore.ao</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Template de email para nova avaliação de produto
 */
export function generateNewReviewEmail(data: {
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  reviewLink: string;
}): string {
  const stars = '⭐'.repeat(data.rating);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .review-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stars { font-size: 24px; margin: 10px 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⭐ Nova Avaliação!</h1>
    </div>
    
    <div class="content">
      <p><strong>${data.customerName}</strong> avaliou o produto:</p>
      <h2>${data.productName}</h2>
      
      <div class="review-box">
        <div class="stars">${stars}</div>
        <p>"${data.comment}"</p>
      </div>
      
      <center>
        <a href="${data.reviewLink}" class="button">Ver Avaliação</a>
      </center>
    </div>
  </div>
</body>
</html>
  `;
}

// Exportar tudo
export default {
  sendEmail,
  generateOrderConfirmationEmail,
  generatePasswordResetEmail,
  generateNewReviewEmail,
};
