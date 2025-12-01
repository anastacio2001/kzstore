/**
 * Script de teste para Resend Email
 * Testa o envio de email com o domínio verificado kzstore.ao
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('📧 Testando envio de email com Resend...\n');
  
  console.log('📋 Configuração:');
  console.log(`   API Key: ${process.env.RESEND_API_KEY?.slice(0, 10)}...`);
  console.log(`   From: ${process.env.RESEND_FROM_EMAIL}`);
  console.log(`   Name: ${process.env.RESEND_FROM_NAME}\n`);

  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to: ['l.anastacio001@gmail.com'], // 👈 Altere para seu email de teste
      subject: '✅ Teste de Email - KZSTORE',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔥 KZSTORE</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Teste de Email</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Email de Teste ✅</h2>
            
            <p>Este é um email de teste do sistema KZSTORE.</p>
            
            <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 5px;">
              <p style="margin: 0;"><strong>✅ Configuração Funcionando!</strong></p>
              <p style="margin: 10px 0 0 0; color: #666;">Domínio: kzstore.ao (verificado)</p>
              <p style="margin: 5px 0 0 0; color: #666;">Provider: Resend</p>
              <p style="margin: 5px 0 0 0; color: #666;">Data: ${new Date().toLocaleString('pt-AO')}</p>
            </div>
            
            <p>Se você recebeu este email, significa que o sistema de envio de emails está configurado corretamente! 🎉</p>
            
            <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 14px;">
              <p style="margin: 5px 0;">KZSTORE Angola</p>
              <p style="margin: 5px 0;">Email: suporte@kzstore.ao</p>
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Todos os direitos reservados</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Erro ao enviar email:', error);
      process.exit(1);
    }

    console.log('✅ Email enviado com sucesso!');
    console.log(`📬 ID do Email: ${data.id}`);
    console.log(`\n💡 Verifique sua caixa de entrada (e spam) em: l.anastacio001@gmail.com\n`);
    
  } catch (error) {
    console.error('❌ Erro ao testar email:', error);
    process.exit(1);
  }
}

testEmail();
