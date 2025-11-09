import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  type: 'new_ticket' | 'admin_response'
  ticketId: string
  userEmail: string
  userName: string
  subject: string
  message: string
  ticketUrl: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { type, ticketId, userEmail, userName, subject, message, ticketUrl } = await req.json() as EmailRequest

    console.log('📧 Sending email:', { type, ticketId, userEmail })

    let emailHtml = ''
    let emailSubject = ''
    let toEmail = ''

    if (type === 'new_ticket') {
      // Email para admins quando novo ticket é criado
      emailSubject = `[Novo Ticket] ${subject}`
      toEmail = 'leuboy30@gmail.com' // Email do admin
      
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #E31E24; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
            .ticket-info { background: white; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .button { display: inline-block; background: #E31E24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎫 Novo Ticket de Suporte</h1>
            </div>
            <div class="content">
              <p>Olá Admin,</p>
              <p>Um novo ticket de suporte foi criado:</p>
              
              <div class="ticket-info">
                <p><strong>Cliente:</strong> ${userName}</p>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Ticket ID:</strong> #${ticketId.substring(0, 8)}</p>
                <p><strong>Assunto:</strong> ${subject}</p>
                <p><strong>Mensagem:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              
              <a href="${ticketUrl}" class="button">Ver Ticket no Admin</a>
            </div>
            <div class="footer">
              <p>KZSTORE - Sistema de Suporte</p>
              <p>Este é um email automático, não responda.</p>
            </div>
          </div>
        </body>
        </html>
      `
    } else if (type === 'admin_response') {
      // Email para usuário quando admin responde
      emailSubject = `[Resposta] ${subject}`
      toEmail = userEmail
      
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #E31E24; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
            .message-box { background: white; padding: 15px; border-left: 4px solid #E31E24; margin: 20px 0; }
            .button { display: inline-block; background: #E31E24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 Nova Resposta do Suporte</h1>
            </div>
            <div class="content">
              <p>Olá ${userName},</p>
              <p>O suporte KZSTORE respondeu ao seu ticket <strong>#${ticketId.substring(0, 8)}</strong>:</p>
              
              <div class="message-box">
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              
              <p>Você pode continuar a conversa clicando no botão abaixo:</p>
              
              <a href="${ticketUrl}" class="button">Acessar Ticket</a>
            </div>
            <div class="footer">
              <p>KZSTORE - Tech & Electronics</p>
              <p>Sector D, Quarteirão 7, Av. 21 de Janeiro, Luanda - Angola</p>
              <p>+244 931 054 015</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    // Enviar email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'KZSTORE Suporte <onboarding@resend.dev>',
        to: [toEmail],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('❌ Resend error:', resendData)
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`)
    }

    console.log('✅ Email sent:', resendData)

    // Registrar envio de email no banco
    await supabase.from('ticket_email_logs').insert({
      ticket_id: ticketId,
      email_type: type,
      recipient: toEmail,
      status: 'sent',
      resend_id: resendData.id,
    })

    return new Response(
      JSON.stringify({ success: true, messageId: resendData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
