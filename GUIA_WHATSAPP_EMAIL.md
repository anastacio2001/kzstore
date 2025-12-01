# 📱💬 GUIA COMPLETO - WhatsApp Business & Email Transacional

**Data:** 27 de Novembro de 2024
**Para:** KZSTORE E-Commerce
**Objetivo:** Configurar comunicação profissional com clientes

---


### **🎯 Status Atual:**
✅ **WhatsApp integrado como link manual**
- Botão no chatbot IA
- Sem mensagens automáticas
- Sem chatbot WhatsApp

#### **✅ O que você já tem:**

#### **📋 Próximos Passos:**

**1. Instalar WhatsApp Business App**
```
📱 Android: Google Play Store
📱 iOS: App Store
🔍 Buscar: "WhatsApp Business"
```

**2. Configurar Perfil Empresarial**
```
           componentes de TI e acessórios com os melhores preços.
Endereço: [Seu endereço em Luanda]
Email: contato@kzstore.com
Website: [Seu site quando estiver no ar]
Horário: Segunda a Sábado, 8h às 18h
```

**3. Ativar Recursos Essenciais**
- ✅ **Mensagem de Saudação** (quando cliente inicia conversa)
- ✅ **Mensagem de Ausência** (fora do horário)
- ✅ **Respostas Rápidas** (templates de mensagens)
- ✅ **Etiquetas** (Organizar conversas: Novo Cliente, Pedido, Dúvida)

#### **📝 Templates de Mensagens Sugeridas:**

**Saudação Automática:**
```
Olá! 👋 Bem-vindo à KZSTORE!

Somos especialistas em tecnologia e eletrônicos em Angola.

🛒 Produtos | 🚚 Entrega Rápida | 💳 Pagamento Fácil

Como posso ajudar você hoje?

1️⃣ Ver produtos
2️⃣ Fazer pedido
3️⃣ Rastrear encomenda
4️⃣ Suporte técnico

Aguardo sua resposta! 😊
```

**Mensagem de Ausência:**
```
Olá! 🌙

No momento estamos fora do horário de atendimento.

⏰ Voltamos: Segunda a Sábado, 8h às 18h

Deixe sua mensagem que responderemos assim que possível!

Ou visite nosso site: [URL]
🤖 Chatbot disponível 24/7!
```

**Respostas Rápidas (Shortcuts):**

`/catalogo`:
```
📱 Confira nosso catálogo completo:
[Link do site]

Categorias:
• Smartphones
• Mini PCs
• SSDs e Armazenamento
• Câmeras Wi-Fi
• Redes e Internet
• Software

Qual categoria te interessa?
```

`/pagamento`:
```
💳 Formas de Pagamento:

✅ Multicaixa Express
✅ Transferência Bancária
✅ TPA (na entrega)

Aceitamos AOA e USD!

Tem alguma dúvida sobre pagamento?
```

`/entrega`:
```
🚚 Informações de Entrega:

📍 Luanda: 2-3 dias úteis
📍 Outras províncias: 5-7 dias úteis

📦 Embalagem segura
🔍 Rastreamento disponível

Qual seu endereço de entrega?
```

`/rastreio`:
```
📦 Para rastrear seu pedido, preciso:

🔢 Número do pedido: #____
📧 Email usado na compra: ____

Por favor, me envie essas informações!
```

#### **💰 Custo:**
- **GRÁTIS** (WhatsApp Business App)
- Limitações: 1 dispositivo, sem API

---

### **🚀 OPÇÃO 2: WhatsApp Business API (PROFISSIONAL)**

#### **✅ Vantagens:**
- Múltiplos atendentes
- Chatbot automático
- Integração com sistema
- Mensagens em massa (com opt-in)
- Análise de métricas
- Notificações de pedido automáticas

#### **⚠️ Requerimentos:**
- Facebook Business Manager
- Verificação de negócio
- Número dedicado (não pode usar pessoal)
- Custo mensal

#### **💰 Custo Estimado:**
- **Setup:** $0 (auto-setup) a $500 (com agência)
- **Mensalidade:**
  - Até 1.000 conversas/mês: GRÁTIS
  - 1.000-10.000: ~$5-50/mês
  - 10.000+: Conforme uso

#### **📋 Como Implementar:**

**1. Pré-requisitos**
```bash
# Criar conta no Meta Business
https://business.facebook.com/

# Verificar empresa
- Documento de registro da empresa
- Comprovante de endereço
- Informações fiscais (NIF)
```

**2. Escolher Provider (Parceiro Oficial)**

**Opções Recomendadas para Angola:**

**A) Twilio (Mais popular)**
```
🌐 Site: twilio.com/whatsapp
💰 Preço: $0.005-0.01 por mensagem
📚 Documentação: Excelente
✅ Suporte: 24/7
```

**B) 360Dialog (Mais barato)**
```
🌐 Site: 360dialog.com
💰 Preço: €0.005 por mensagem
📚 Doc: Boa
✅ Setup: Mais simples
```

**C) MessageBird**
```
🌐 Site: messagebird.com
💰 Preço: Variável
📚 Doc: Muito boa
```

**3. Integração no Backend (Exemplo com Twilio)**

Instalar dependências:
```bash
```

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER; // +244...

const client = twilio(accountSid, authToken);

/**
 * Enviar mensagem WhatsApp
 */
export async function sendWhatsAppMessage(
  to: string, // +244931054015
  message: string
) {
  try {
    const result = await client.messages.create({
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${to}`,
      body: message
    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp:', error);
    throw error;
  }
}

/**
 * Enviar notificação de pedido
 */
export async function notifyOrderCreated(
  phoneNumber: string,
  orderNumber: string,
  total: number
) {
  const message = `
🎉 Pedido Confirmado - KZSTORE

📦 Pedido: #${orderNumber}
💰 Total: ${total.toLocaleString('pt-AO')} Kz

✅ Recebemos seu pedido!
🚚 Você receberá atualizações sobre a entrega.

Obrigado por comprar na KZSTORE! 😊

Dúvidas? Responda esta mensagem!
  `.trim();

  return await sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Notificar atualização de status
 */
export async function notifyOrderStatus(
  phoneNumber: string,
  orderNumber: string,
  status: string,
  trackingCode?: string
) {
  let message = `
📦 Atualização do Pedido #${orderNumber}

Status: ${status}
  `.trim();

  if (trackingCode) {
    message += `\n🔍 Código de rastreio: ${trackingCode}`;
  }

  message += '\n\nKZSTORE - Tecnologia de Qualidade 🚀';

  return await sendWhatsAppMessage(phoneNumber, message);
}
```

Adicionar ao `.env`:
```env
# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
```

Usar no checkout:
```typescript
// server.ts - No endpoint de criar pedido
import { notifyOrderCreated } from './backend/whatsapp';

app.post('/api/orders', async (req, res) => {
  // ... criar pedido ...

  const order = await prisma.order.create({ /* ... */ });

  // Enviar notificação WhatsApp
  try {
    await notifyOrderCreated(
      order.telefone,
      order.numero_pedido,
      order.total_aoa
    );
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    // Não falhar o pedido se WhatsApp falhar
  }

  res.json({ order });
});
```

#### **🔒 Compliance WhatsApp:**
⚠️ **IMPORTANTE - Regras do WhatsApp:**
1. Cliente deve **optar por receber** (opt-in)
2. Mensagens devem ser **relevantes**
3. Cliente pode **cancelar** (opt-out)
4. Não enviar spam
5. Janela de 24h para responder

**Implementar Opt-in no Checkout:**
```typescript
// No formulário de checkout
<label>
  <input
    type="checkbox"
    name="whatsapp_opt_in"
    defaultChecked
  />
  Aceito receber atualizações do pedido via WhatsApp
</label>
```

---

## 📧 PARTE 2: EMAIL TRANSACIONAL

### **🎯 O que são Emails Transacionais:**
Emails automáticos enviados após ações do usuário:
- ✅ Confirmação de pedido
- ✅ Atualização de status
- ✅ Recuperação de senha
- ✅ Boas-vindas
- ✅ Código de rastreio

❌ **NÃO incluem:**
- Newsletters (marketing)
- Promoções
- Emails em massa

---

### **📊 COMPARAÇÃO DE SERVIÇOS**

| Provider | Grátis/Mês | Custo Extra | Facilidade | Recomendação |
|----------|------------|-------------|------------|--------------|
| **Resend** | 3.000 | $20/50k | ⭐⭐⭐⭐⭐ Muito fácil | ✅ **MELHOR** |
| SendGrid | 100 | $15/40k | ⭐⭐⭐⭐ Fácil | ✅ Bom |
| Mailgun | 5.000 | $35/50k | ⭐⭐⭐ Médio | ✅ OK |
| Amazon SES | 3.000 | $0.10/1k | ⭐⭐ Difícil | ⚠️ Técnico |
| Gmail SMTP | 500 | - | ⭐⭐ Limitado | ❌ Não use |

**Recomendação:** **Resend** (mais moderno, fácil e generoso)

---

### **🚀 CONFIGURAÇÃO - RESEND (Recomendado)**

#### **1. Criar Conta**
```
🌐 Site: resend.com
📧 Cadastrar com email profissional
✅ Verificar email
```

#### **2. Verificar Domínio (Opcional mas Recomendado)**

Se você tem domínio (kzstore.com):
```
1. Adicionar domínio no Resend
2. Copiar registros DNS (SPF, DKIM, DMARC)
3. Adicionar no painel do seu registrador de domínio
4. Aguardar verificação (até 48h)
```

**Vantagens de domínio próprio:**
- ✅ Emails de: contato@kzstore.com
- ✅ Melhor entregabilidade
- ✅ Mais profissional
- ✅ Menos chance de spam

**Sem domínio (temporário):**
- Usar: noreply@resend.dev
- Funciona, mas menos profissional

#### **3. Obter API Key**
```
1. Dashboard → API Keys
2. Create API Key
3. Nome: "KZSTORE Production"
4. Permissões: "Sending access"
5. Copiar a chave (só aparece uma vez!)
```

#### **4. Instalar no Backend**

```bash
npm install resend
```

Criar serviço de email:
```typescript
// backend/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'KZSTORE <noreply@resend.dev>';

/**
 * Enviar email de confirmação de pedido
 */
export async function sendOrderConfirmation(
  to: string,
  orderData: {
    orderNumber: string;
    customerName: string;
    total: number;
    items: any[];
    paymentMethod: string;
  }
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Pedido Confirmado #${orderData.orderNumber} - KZSTORE`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .total { font-size: 24px; font-weight: bold; color: #DC2626; text-align: right; margin-top: 20px; }
            .footer { text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
            .button { display: inline-block; background: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Pedido Confirmado!</h1>
              <p>Obrigado pela sua compra, ${orderData.customerName}!</p>
            </div>

            <div class="content">
              <h2>Detalhes do Pedido #${orderData.orderNumber}</h2>

              <div class="order-summary">
                <h3>Itens do Pedido:</h3>
                ${orderData.items.map(item => `
                  <div class="item">
                    <div>
                      <strong>${item.nome}</strong><br>
                      <span style="color: #666;">Quantidade: ${item.quantidade}</span>
                    </div>
                    <div style="text-align: right;">
                      ${item.preco_unitario.toLocaleString('pt-AO')} Kz
                    </div>
                  </div>
                `).join('')}

                <div class="total">
                  Total: ${orderData.total.toLocaleString('pt-AO')} Kz
                </div>
              </div>

              <p><strong>Forma de Pagamento:</strong> ${orderData.paymentMethod}</p>

              <p>
                ${orderData.paymentMethod === 'Transferência Bancária' ? `
                  <strong>Dados para Transferência:</strong><br>
                  Banco: BAI<br>
                  Conta: 123456789<br>
                  IBAN: AO06.0000.0000.1234.5678.9012.3<br>
                  Titular: KZSTORE LDA<br><br>
                  ⚠️ Envie o comprovante via WhatsApp: +244 931 054 015
                ` : ''}
              </p>

              <div style="text-align: center;">
                <a href="http://kzstore.com/orders/${orderData.orderNumber}" class="button">
                  Acompanhar Pedido
                </a>
              </div>

              <p>Você receberá atualizações sobre o status do seu pedido.</p>
            </div>

            <div class="footer">
              <p>
                <strong>KZSTORE - Tecnologia de Qualidade em Angola</strong><br>
                📱 WhatsApp: +244 931 054 015<br>
                📧 Email: contato@kzstore.com<br>
                🌐 Website: kzstore.com
              </p>
              <p style="font-size: 12px; color: #999;">
                Você recebeu este email porque fez um pedido na KZSTORE.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Erro ao enviar email:', error);
      throw error;
    }

    console.log('✅ Email enviado:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw error;
  }
}

/**
 * Enviar atualização de status do pedido
 */
export async function sendOrderStatusUpdate(
  to: string,
  orderNumber: string,
  customerName: string,
  newStatus: string,
  trackingCode?: string
) {
  const statusMessages: Record<string, string> = {
    'Pagamento Confirmado': '✅ Seu pagamento foi confirmado!',
    'Em Preparação': '📦 Estamos preparando seu pedido!',
    'Enviado': '🚚 Seu pedido foi enviado!',
    'Entregue': '🎉 Seu pedido foi entregue!'
  };

  const message = statusMessages[newStatus] || `Status atualizado: ${newStatus}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Atualização do Pedido #${orderNumber} - KZSTORE`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-badge { background: #10B981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; }
            .button { display: inline-block; background: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Atualização do Pedido</h1>
            </div>

            <div class="content">
              <p>Olá ${customerName},</p>

              <p>${message}</p>

              <div class="status-badge">${newStatus}</div>

              <p><strong>Pedido:</strong> #${orderNumber}</p>

              ${trackingCode ? `
                <p>
                  <strong>Código de Rastreio:</strong><br>
                  <code style="background: #eee; padding: 10px; display: inline-block; border-radius: 5px;">
                    ${trackingCode}
                  </code>
                </p>
              ` : ''}

              <div style="text-align: center;">
                <a href="http://kzstore.com/orders/${orderNumber}" class="button">
                  Ver Detalhes do Pedido
                </a>
              </div>

              <p>Dúvidas? Entre em contato conosco via WhatsApp!</p>
            </div>

            <div style="text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p>
                <strong>KZSTORE</strong><br>
                📱 +244 931 054 015 | 📧 contato@kzstore.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) throw error;

    console.log('✅ Email de status enviado:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao enviar email de status:', error);
    throw error;
  }
}

/**
 * Email de boas-vindas
 */
export async function sendWelcomeEmail(
  to: string,
  customerName: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Bem-vindo à KZSTORE! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #DC2626; }
            .button { display: inline-block; background: #DC2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bem-vindo à KZSTORE!</h1>
              <p>A sua loja de tecnologia em Angola</p>
            </div>

            <div class="content">
              <p>Olá ${customerName},</p>

              <p>É um prazer ter você conosco! 🚀</p>

              <p>Na KZSTORE, você encontra:</p>

              <div class="feature">
                📱 <strong>Tecnologia de Qualidade</strong><br>
                Smartphones, Mini PCs, SSDs e muito mais!
              </div>

              <div class="feature">
                🚚 <strong>Entrega Rápida</strong><br>
                2-3 dias em Luanda, rastreamento incluído
              </div>

              <div class="feature">
                💳 <strong>Pagamento Facilitado</strong><br>
                Multicaixa Express, Transferência ou TPA
              </div>

              <div class="feature">
                🎁 <strong>Ofertas Exclusivas</strong><br>
                Flash sales e promoções especiais
              </div>

              <div style="text-align: center;">
                <a href="http://kzstore.com" class="button">
                  Começar a Comprar
                </a>
              </div>

              <p>
                💬 <strong>Precisa de ajuda?</strong><br>
                Nosso chatbot IA está disponível 24/7 ou fale conosco via WhatsApp!
              </p>
            </div>

            <div style="text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p>
                <strong>KZSTORE - Tecnologia de Qualidade em Angola</strong><br>
                📱 WhatsApp: +244 931 054 015<br>
                📧 Email: contato@kzstore.com<br>
                🌐 Website: kzstore.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) throw error;

    console.log('✅ Email de boas-vindas enviado:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error);
    throw error;
  }
}
```

Adicionar ao `.env`:
```env
# Resend Email
RESEND_API_KEY=re_123456789_XXXXXXXXXXXXXXXXXXXXXXXX
FROM_EMAIL=KZSTORE <contato@kzstore.com>
```

Integrar no servidor:
```typescript
// server.ts
import { sendOrderConfirmation, sendWelcomeEmail } from './backend/email';

// Ao criar pedido
app.post('/api/orders', async (req, res) => {
  const order = await prisma.order.create({ /* ... */ });

  // Enviar email de confirmação
  try {
    await sendOrderConfirmation(order.user_email, {
      orderNumber: order.numero_pedido,
      customerName: order.user_name,
      total: order.total_aoa,
      items: order.items,
      paymentMethod: order.payment_method
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    // Não falhar o pedido
  }

  res.json({ order });
});

// Ao registrar novo cliente
app.post('/api/auth/register', async (req, res) => {
  const customer = await prisma.customerProfile.create({ /* ... */ });

  // Enviar email de boas-vindas
  try {
    await sendWelcomeEmail(customer.email, customer.nome);
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
  }

  res.json({ customer, token });
});
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **WhatsApp Business App (Fácil - 30 min)**
- [ ] Instalar WhatsApp Business no celular
- [ ] Configurar perfil empresarial
- [ ] Criar mensagem de saudação
- [ ] Criar mensagem de ausência
- [ ] Criar 5 respostas rápidas
- [ ] Definir etiquetas (Novo, Pedido, Dúvida, etc.)
- [ ] Testar envio de mensagem

### **Email com Resend (Médio - 2 horas)**
- [ ] Criar conta no Resend
- [ ] (Opcional) Verificar domínio próprio
- [ ] Obter API Key
- [ ] Instalar pacote resend: `npm install resend`
- [ ] Criar arquivo `backend/email.ts`
- [ ] Adicionar RESEND_API_KEY no .env
- [ ] Integrar no endpoint de pedidos
- [ ] Testar envio de email
- [ ] Verificar chegada (inbox, não spam)

### **WhatsApp API (Avançado - 1-2 dias)**
- [ ] Criar Facebook Business Manager
- [ ] Verificar empresa no Meta
- [ ] Escolher provider (Twilio/360Dialog)
- [ ] Criar conta no provider
- [ ] Obter número WhatsApp Business
- [ ] Configurar webhooks
- [ ] Instalar SDK: `npm install twilio`
- [ ] Criar `backend/whatsapp.ts`
- [ ] Testar notificação de pedido
- [ ] Implementar opt-in no checkout

---

## 🧪 TESTES

### **Testar WhatsApp:**
```
1. Abrir site
2. Clicar no botão WhatsApp
3. Verificar se abre conversa correta
4. Enviar mensagem de teste
5. Verificar se resposta automática funciona
```

### **Testar Email:**
```
1. Fazer pedido de teste
2. Verificar inbox (e spam)
3. Clicar nos links do email
4. Verificar formatação mobile
5. Responder email (se permitido)
```

---

## 📊 MONITORAMENTO

### **Métricas WhatsApp:**
- Tempo de resposta médio
- Taxa de resposta
- Satisfação do cliente
- Conversas iniciadas/dia

### **Métricas Email:**
- Taxa de entrega (>95%)
- Taxa de abertura (>20%)
- Taxa de clique (>5%)
- Taxa de spam (<1%)

---

## 🚀 PRÓXIMOS PASSOS

1. **Esta Semana:**
   - [ ] Configurar WhatsApp Business App
   - [ ] Configurar Resend Email
   - [ ] Testar envios

2. **Próximo Mês:**
   - [ ] Avaliar migração para WhatsApp API
   - [ ] Criar mais templates de email
   - [ ] Implementar SMS (opcional)

3. **Futuro:**
   - [ ] Chatbot WhatsApp
   - [ ] Campanhas de email marketing
   - [ ] Integração com CRM

---

**Pronto para começar!** 🎉

Qualquer dúvida, estou aqui para ajudar!
