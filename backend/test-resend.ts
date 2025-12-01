/**
 * Script de teste para Resend
 * Execute: npx tsx backend/test-resend.ts
 */

import { sendEmail, generateOrderConfirmationEmail } from './mailer';

async function testResend() {
  console.log('🧪 [TEST] Testando Resend...\n');

  // Teste 1: Email simples
  console.log('📧 [TEST 1] Enviando email de teste simples...');
  const result1 = await sendEmail({
    to: 'l.anastacio001@gmail.com',
    subject: '✅ Teste Resend - KZSTORE',
    html: `
      <h1>🎉 Email de Teste</h1>
      <p>Este é um email de teste do sistema KZSTORE.</p>
      <p>Se você recebeu este email, a configuração do Resend está funcionando corretamente!</p>
      <hr>
      <p><small>Data/Hora: ${new Date().toLocaleString('pt-AO')}</small></p>
    `,
  });

  console.log('Resultado:', result1);
  console.log('\n---\n');

  // Teste 2: Email de confirmação de pedido
  console.log('📧 [TEST 2] Enviando email de confirmação de pedido...');
  const orderEmail = generateOrderConfirmationEmail({
    orderId: 'TEST-' + Date.now(),
    customerName: 'Cliente Teste',
    items: [
      { name: 'iPhone 15 Pro Max', quantity: 1, price: 500000 },
      { name: 'AirPods Pro', quantity: 2, price: 150000 },
    ],
    total: 800000,
    shippingAddress: 'Luanda, Talatona, Condomínio Jardim da Íris, Casa 123',
  });

  const result2 = await sendEmail({
    to: 'l.anastacio001@gmail.com',
    subject: '🎉 Pedido Confirmado - KZSTORE',
    html: orderEmail,
  });

  console.log('Resultado:', result2);
  console.log('\n---\n');

  console.log('✅ [TEST] Testes concluídos!');
  console.log('📬 Verifique sua caixa de entrada (e spam) para ver os emails.');
}

testResend().catch((error) => {
  console.error('❌ [TEST] Erro nos testes:', error);
  process.exit(1);
});
