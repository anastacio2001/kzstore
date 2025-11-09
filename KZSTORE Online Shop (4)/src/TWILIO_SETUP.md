# 📞 GUIA DE CONFIGURAÇÃO TWILIO - KZSTORE

## 🎯 Objetivo

Integrar Twilio para:
1. **Autenticação OTP** via WhatsApp/SMS
2. **Recuperação de carrinho** abandonado
3. **Notificações de pedidos** automáticas
4. **Mensagens de boas-vindas** para novos clientes

---

## 📋 PRÉ-REQUISITOS

### 1. Conta Twilio
- Criar conta em: https://www.twilio.com/try-twilio
- Verificar número de telefone
- Obter créditos (trial ou produção)

### 2. Serviços Twilio Necessários

#### a) Twilio Verify (para OTP)
- Dashboard → Develop → Verify → Services
- Criar novo serviço: "KZSTORE Authentication"
- Copiar o **Service SID** (ex: `VAxxxx...`)

#### b) WhatsApp Sandbox (para testes)
- Messaging → Try it out → Send a WhatsApp message
- Ativar sandbox seguindo instruções
- Número sandbox: `whatsapp:+14155238886`

#### c) WhatsApp Business API (produção)
- Após aprovação: WhatsApp → Senders
- Solicitar número WhatsApp dedicado
- Completar verificação do negócio

---

## 🔑 VARIÁVEIS DE AMBIENTE

### No Supabase Dashboard → Settings → Edge Functions → Secrets

Adicione as seguintes variáveis:

```bash
# 1. Credenciais Principais
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 2. Serviço Verify (para OTP)
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 3. Número WhatsApp (sandbox ou produção)
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Sandbox
# OU
TWILIO_WHATSAPP_NUMBER=whatsapp:+244931054015  # Produção (após aprovação)
```

---

## 🔍 ONDE ENCONTRAR AS CREDENCIAIS

### TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN
```
1. Login no Twilio Console
2. Dashboard → Account Info (canto superior direito)
3. Copiar:
   - Account SID
   - Auth Token (clicar em "show" para revelar)
```

### TWILIO_VERIFY_SERVICE_SID
```
1. Twilio Console → Develop → Verify → Services
2. Clicar no serviço "KZSTORE Authentication"
3. Copiar o Service SID (formato: VAxxxx...)
```

### TWILIO_WHATSAPP_NUMBER

**Para Testes (Sandbox):**
```
1. Messaging → Try it out → Send a WhatsApp message
2. Número: whatsapp:+14155238886
3. Ativar enviando mensagem de código para o sandbox
```

**Para Produção:**
```
1. Messaging → WhatsApp → Senders
2. Request Access (aguardar aprovação - 1-2 semanas)
3. Após aprovado: comprar número WhatsApp dedicado
4. Número formato: whatsapp:+244931054015
```

---

## 🧪 TESTAR CONFIGURAÇÃO

### 1. Verificar Status
```bash
GET https://{project-id}.supabase.co/functions/v1/make-server-d8a4dffd/twilio/status
```

**Resposta esperada:**
```json
{
  "configured": true,
  "services": {
    "otp": true,
    "messaging": true,
    "whatsapp": true
  },
  "message": "Twilio configurado e pronto para uso"
}
```

### 2. Testar Envio de OTP
```bash
POST https://{project-id}.supabase.co/functions/v1/make-server-d8a4dffd/twilio/send-otp

Body:
{
  "phone": "+244931054015"
}
```

### 3. Verificar OTP
```bash
POST https://{project-id}.supabase.co/functions/v1/make-server-d8a4dffd/twilio/verify-otp

Body:
{
  "phone": "+244931054015",
  "code": "123456"
}
```

---

## 📱 FUNCIONALIDADES IMPLEMENTADAS

### 1. 🔐 Autenticação OTP

**Fluxo:**
1. Cliente insere telefone
2. Sistema envia código via WhatsApp (fallback SMS)
3. Cliente insere código
4. Sistema valida e cria conta

**Endpoints:**
- `POST /twilio/send-otp` - Envia código
- `POST /twilio/verify-otp` - Valida código

---

### 2. 🛒 Recuperação de Carrinho

**Quando dispara:**
- Cliente adiciona produtos ao carrinho
- Não finaliza compra em 30 minutos
- Sistema detecta carrinho abandonado

**Mensagem enviada:**
```
Olá João! 👋

Notamos que você deixou alguns produtos no carrinho:

1. Memória RAM DDR4 16GB (2x)
2. SSD 1TB Samsung (1x)
... e mais 1 produtos

💰 Total: 150.000 AOA

🎁 Finalize agora e ganhe 10% de desconto!

Clique aqui para continuar: https://kzstore.ao/carrinho/abc123
```

**Endpoint:**
```bash
POST /twilio/cart-recovery

Body:
{
  "phone": "+244931054015",
  "customerName": "João Silva",
  "items": [...],
  "cartTotal": 150000,
  "cartId": "abc123"
}
```

---

### 3. 📦 Notificações de Pedidos

**Status rastreados:**
- `pending` - Pedido recebido, aguardando pagamento
- `confirmed` - Pagamento confirmado
- `shipped` - Pedido enviado
- `delivered` - Pedido entregue
- `cancelled` - Pedido cancelado

**Exemplo de mensagem:**
```
✅ Pagamento confirmado! Pedido #KZ12345 está sendo preparado.
```

**Endpoint:**
```bash
POST /twilio/order-notification

Body:
{
  "phone": "+244931054015",
  "orderNumber": "KZ12345",
  "status": "confirmed",
  "customerName": "João Silva"
}
```

---

### 4. 👋 Mensagem de Boas-Vindas

**Quando dispara:**
- Cliente cria conta
- Primeiro login

**Mensagem enviada:**
```
Bem-vindo à KZSTORE, João! 🎉

Obrigado por se cadastrar. Você agora tem acesso a:

✅ Produtos exclusivos
✅ Ofertas especiais
✅ Atendimento prioritário
✅ Rastreamento de pedidos

Explore nosso catálogo: https://kzstore.ao
```

**Endpoint:**
```bash
POST /twilio/welcome-message

Body:
{
  "phone": "+244931054015",
  "customerName": "João Silva"
}
```

---

## 🔄 INTEGRAÇÃO NO CÓDIGO

### Frontend - Autenticação OTP

```typescript
// No componente AuthModal.tsx (já implementado)
const handlePhoneAuth = async () => {
  const response = await fetch('/api/twilio/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: formData.telefone })
  });
  
  const data = await response.json();
  
  if (data.success) {
    setOtpSent(true);
  }
};
```

### Backend - Recuperação de Carrinho

```typescript
// Criar função para detectar carrinhos abandonados
async function checkAbandonedCarts() {
  const carts = await kv.getByPrefix('cart:');
  
  for (const cart of carts) {
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    
    if (cart.lastUpdated < thirtyMinutesAgo && !cart.recovered) {
      // Enviar notificação
      await fetch('/twilio/cart-recovery', {
        method: 'POST',
        body: JSON.stringify({
          phone: cart.customerPhone,
          customerName: cart.customerName,
          items: cart.items,
          cartTotal: cart.total,
          cartId: cart.id
        })
      });
      
      // Marcar como recuperado
      cart.recovered = true;
      await kv.set(`cart:${cart.id}`, cart);
    }
  }
}

// Executar a cada 10 minutos
setInterval(checkAbandonedCarts, 10 * 60 * 1000);
```

---

## 💰 CUSTOS TWILIO

### Preços Estimados (USD):

| Serviço | Custo por Unidade | Exemplo Mensal |
|---------|-------------------|----------------|
| **SMS Verify** | $0.05 / verificação | 100 clientes = $5 |
| **WhatsApp Verify** | $0.005 / verificação | 100 clientes = $0.50 |
| **WhatsApp Message** | $0.005 / mensagem | 500 msgs = $2.50 |
| **SMS Message** | $0.0075 / SMS | 100 SMS = $0.75 |

**Estimativa para 100 clientes/mês:**
- OTP via WhatsApp: $0.50
- Boas-vindas: $0.50
- Notificações de pedidos (média 3/cliente): $1.50
- Recuperação de carrinho (20% abandono): $0.10
- **TOTAL:** ~$3/mês

**⚠️ Nota:** Preços podem variar por região. Angola pode ter custos diferentes.

---

## 🔒 SEGURANÇA

### 1. Rate Limiting
```typescript
// Já implementado no middleware.tsx
app.use('/make-server-d8a4dffd/*', rateLimit(100, 15 * 60 * 1000));
```

### 2. Validação de Números
```typescript
// Sempre formatar e validar telefones
const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
```

### 3. Proteção de Credenciais
- ✅ Nunca expor `TWILIO_AUTH_TOKEN` no frontend
- ✅ Usar variáveis de ambiente
- ✅ Endpoints apenas no backend

---

## 🚨 TROUBLESHOOTING

### Problema: "Código OTP não chega"

**Soluções:**
1. Verificar se número está no formato internacional (+244...)
2. Confirmar que serviço Verify está ativo
3. Verificar créditos Twilio
4. Testar primeiro com SMS, depois WhatsApp

### Problema: "WhatsApp sandbox not joined"

**Solução:**
```
1. Abrir WhatsApp
2. Adicionar contato: +1 415 523 8886
3. Enviar mensagem: "join [código-sandbox]"
4. Aguardar confirmação
5. Testar novamente
```

### Problema: "Authentication failed"

**Soluções:**
1. Verificar `TWILIO_ACCOUNT_SID` e `TWILIO_AUTH_TOKEN`
2. Confirmar que não há espaços extras nas variáveis
3. Re-criar tokens no Twilio Console
4. Verificar se conta está ativa (não suspensa)

### Problema: "Service SID not found"

**Solução:**
```
1. Twilio Console → Verify → Services
2. Confirmar que serviço existe
3. Copiar SID correto (começa com VA...)
4. Atualizar variável TWILIO_VERIFY_SERVICE_SID
```

---

## 📊 MONITORAMENTO

### Verificar Logs Twilio
```
1. Twilio Console → Monitor → Logs
2. Filtrar por:
   - Messaging
   - Verify
   - Errors
3. Analisar mensagens falhadas
```

### Verificar Custos
```
1. Twilio Console → Usage
2. Ver gráficos de uso
3. Configurar alertas de custo
```

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### Fase 1: Configuração Inicial
- [ ] Criar conta Twilio
- [ ] Verificar telefone pessoal
- [ ] Adicionar créditos ($10 mínimo recomendado)
- [ ] Criar serviço Verify

### Fase 2: Variáveis de Ambiente
- [ ] `TWILIO_ACCOUNT_SID` adicionado
- [ ] `TWILIO_AUTH_TOKEN` adicionado
- [ ] `TWILIO_VERIFY_SERVICE_SID` adicionado
- [ ] `TWILIO_WHATSAPP_NUMBER` adicionado

### Fase 3: Testes
- [ ] Testar endpoint `/twilio/status`
- [ ] Enviar OTP teste
- [ ] Verificar OTP teste
- [ ] Enviar mensagem WhatsApp teste
- [ ] Verificar logs Twilio

### Fase 4: Produção
- [ ] Solicitar WhatsApp Business API
- [ ] Aguardar aprovação Twilio/Meta
- [ ] Atualizar número WhatsApp produção
- [ ] Configurar templates de mensagem
- [ ] Ativar monitoramento

---

## 📚 RECURSOS ADICIONAIS

### Documentação Oficial
- **Twilio Verify:** https://www.twilio.com/docs/verify
- **WhatsApp Business API:** https://www.twilio.com/docs/whatsapp
- **Messaging API:** https://www.twilio.com/docs/sms

### Suporte
- **Twilio Support:** https://support.twilio.com
- **Status Page:** https://status.twilio.com
- **Community:** https://www.twilio.com/community

---

## 🎯 PRÓXIMOS PASSOS

1. **Agora:** Configurar Twilio Sandbox para testes
2. **Esta Semana:** Testar todas as funcionalidades
3. **Este Mês:** Solicitar WhatsApp Business API
4. **Próximo Mês:** Ir para produção com número dedicado

---

**Configuração criada por:** KZSTORE / BVLE CAPITAL  
**Data:** Dezembro 2024  
**Versão:** 1.0  
**Status:** Pronto para implementação
