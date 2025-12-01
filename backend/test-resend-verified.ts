/**
 * Teste de envio de email com domínio verificado
 * Usar após registros DNS estarem propagados
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_jjyJF16u_3zkM9UCPMz2YtgjKmU4D4qqt');

async function testVerifiedDomain() {
  console.log('🔍 Testando envio com domínio verificado...');
  console.log('📧 From:', process.env.RESEND_FROM_EMAIL || 'noreply@kzstore.ao');
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@kzstore.ao',
      to: ['l.anastacio001@gmail.com'], // Email do admin
      subject: '✅ Teste - Domínio KZSTORE Verificado!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">🎉 Domínio Verificado com Sucesso!</h1>
          
          <p>Este é um email de teste enviado do domínio <strong>kzstore.ao</strong></p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Informações do Teste</h2>
            <ul style="list-style: none; padding: 0;">
              <li>📅 Data: ${new Date().toLocaleString('pt-AO')}</li>
              <li>📧 De: ${process.env.RESEND_FROM_EMAIL || 'noreply@kzstore.ao'}</li>
              <li>🔑 Provider: Resend</li>
              <li>🌍 Região: EU-West-1 (Ireland)</li>
            </ul>
          </div>
          
          <div style="background: #dcfce7; padding: 15px; border-left: 4px solid #16a34a; margin: 20px 0;">
            <strong>✅ Status:</strong> O domínio está configurado corretamente e pronto para enviar emails!
          </div>
          
          <h3>Próximos Passos:</h3>
          <ol>
            <li>Atualizar variáveis de ambiente no Google Cloud</li>
            <li>Fazer deploy da aplicação</li>
            <li>Testar fluxo completo de pedidos</li>
            <li>Monitorar logs de email no Resend</li>
          </ol>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6b7280; font-size: 14px;">
            Este é um email automático de teste enviado pela KZSTORE.<br>
            Se você recebeu este email, significa que o sistema de emails está funcionando corretamente! 🎊
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Erro ao enviar email:', error);
      process.exit(1);
    }

    console.log('✅ Email enviado com sucesso!');
    console.log('📧 ID:', data?.id);
    console.log('');
    console.log('🔍 Verifique:');
    console.log('1. Caixa de entrada de l.anastacio001@gmail.com');
    console.log('2. Pasta de spam/lixo eletrônico');
    console.log('3. Dashboard do Resend: https://resend.com/emails');
    console.log('');
    console.log('💡 Se o email não chegou:');
    console.log('- Aguarde alguns minutos (pode demorar)');
    console.log('- Verifique se os registros DNS estão propagados');
    console.log('- Confirme no Resend que todos os records estão "Verified"');
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
    process.exit(1);
  }
}

// Verificar se domínio está configurado
async function checkDomainStatus() {
  console.log('🔍 Verificando status do domínio...');
  console.log('');
  
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@kzstore.ao';
  
  if (!fromEmail.includes('@kzstore.ao')) {
    console.log('⚠️  AVISO: Email configurado não usa domínio kzstore.ao');
    console.log('📧 Email atual:', fromEmail);
    console.log('');
    console.log('Para usar domínio verificado, execute:');
    console.log('RESEND_FROM_EMAIL="noreply@kzstore.ao" npx tsx backend/test-resend-verified.ts');
    console.log('');
  }
  
  await testVerifiedDomain();
}

checkDomainStatus();
