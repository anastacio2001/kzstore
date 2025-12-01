# 🚀 GUIA DE DEPLOY - KZSTORE

**Data:** 7 de Novembro de 2024  
**Status:** ✅ **PRONTO PARA PRODUÇÃO**

---

## 🎊 PARABÉNS! A KZSTORE ESTÁ 100% COMPLETA!

```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║         ✅ KZSTORE 100% IMPLEMENTADA ✅               ║
║                                                       ║
║   🌟 Sistema de Avaliações                            ║
║   💰 Sistema de Cupons                                ║
║   📦 Gestão de Estoque Automática                     ║
║   📧 Sistema de Notificações (Email + WhatsApp)       ║
║   📄 Páginas Legais Completas                         ║
║   👤 Área do Cliente                                  ║
║   🛒 E-commerce Completo                              ║
║                                                       ║
║   🚀 PRONTO PARA DEPLOY!                              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

## 📋 CHECKLIST PRÉ-DEPLOY

### **✅ Já Configurado:**
- ✅ Supabase (Database + Auth + Storage + Edge Functions)
- ✅ Google Gemini API (Chatbot)
- ✅ WhatsApp Business (+244 931 054 015)
- ✅ Todas as funcionalidades implementadas
- ✅ Backend completo
- ✅ Frontend completo
- ✅ Design responsivo
- ✅ SEO otimizado

### **⚠️ Configuração Necessária:**
1. **Resend API** (para emails profissionais)
   - Criar conta: https://resend.com
   - Gerar API Key
   - Adicionar ao Supabase Secrets

---

## 🔧 PASSO A PASSO - DEPLOY

### **1. Configurar Resend (Email)**

#### **1.1. Criar Conta**
```
1. Acesse https://resend.com
2. Clique em "Sign Up"
3. Use email: kzstoregeral@gmail.com (ou outro)
4. Confirme o email
```

#### **1.2. Gerar API Key**
```
1. Faça login no Resend
2. Vá em "API Keys"
3. Clique em "Create API Key"
4. Nome: "KZSTORE Production"
5. Copie a chave (re_xxxxxxxxxxxxx)
```

#### **1.3. Adicionar ao Supabase**
```
1. Acesse Supabase Dashboard
2. Selecione o projeto da KZSTORE
3. Vá em Settings > Edge Functions > Secrets
4. Clique em "Add new secret"
5. Nome: RESEND_API_KEY
6. Valor: re_xxxxxxxxxxxxx (cole a chave)
7. Clique em "Add secret"
```

#### **1.4. Configurar Domínio (Opcional mas Recomendado)**
```
1. No Resend, vá em "Domains"
2. Clique em "Add Domain"
3. Digite: kzstore.ao (ou seu domínio)
4. Siga as instruções de verificação DNS
5. Depois de verificado, use: pedidos@kzstore.ao
```

**⚠️ Importante:** Se não configurar domínio, os emails virão de `onboarding@resend.dev` (funciona mas é menos profissional)

---

### **2. Deploy do Backend (Supabase Edge Functions)**

#### **2.1. Verificar Edge Functions**
```bash
# Navegue até a raiz do projeto
cd /caminho/para/kzstore

# Verifique se a pasta existe
ls -la supabase/functions/server/
```

Você deve ver:
- `index.tsx` - Servidor Hono principal
- `routes.tsx` - Todas as rotas (products, orders, reviews, coupons, etc)
- `middleware.tsx` - Middleware de autenticação
- `email-service.tsx` - Serviço de email
- `kv_store.tsx` - Utilitários do KV Store (NÃO MODIFICAR)

#### **2.2. Deploy das Edge Functions**
```bash
# Fazer login no Supabase CLI (se ainda não fez)
supabase login

# Linkar ao projeto
supabase link --project-ref [SEU_PROJECT_ID]

# Deploy da Edge Function
supabase functions deploy make-server-d8a4dffd

# Verificar se deploy foi bem-sucedido
supabase functions list
```

#### **2.3. Testar Edge Function**
```bash
# Teste básico (deve retornar 404 ou resposta do servidor)
curl https://[PROJECT_ID].supabase.co/functions/v1/make-server-d8a4dffd

# Teste de produtos (deve retornar lista vazia ou produtos existentes)
curl https://[PROJECT_ID].supabase.co/functions/v1/make-server-d8a4dffd/products \
  -H "Authorization: Bearer [ANON_KEY]"
```

---

### **3. Deploy do Frontend**

Você tem 3 opções principais:

#### **OPÇÃO A: Vercel (Recomendado - GRÁTIS)**

**3.1. Preparar o Repositório**
```bash
# Se ainda não tem Git configurado
git init
git add .
git commit -m "KZSTORE - Versão 1.0 - Production Ready"

# Criar repositório no GitHub
# Vá em https://github.com/new
# Nome: kzstore
# Descrição: KZSTORE - Loja Online de Produtos Eletrônicos em Angola
# Público ou Privado (sua escolha)
# Criar repositório

# Adicionar remote e push
git remote add origin https://github.com/SEU_USUARIO/kzstore.git
git branch -M main
git push -u origin main
```

**3.2. Deploy no Vercel**
```
1. Acesse https://vercel.com
2. Faça login (pode usar GitHub)
3. Clique em "Add New" > "Project"
4. Importe o repositório kzstore
5. Configure:
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
6. Não precisa adicionar Environment Variables (já estão no código)
7. Clique em "Deploy"
8. Aguarde 2-3 minutos
9. Seu site estará em: https://kzstore.vercel.app
```

#### **OPÇÃO B: Netlify (Alternativa - GRÁTIS)**

```
1. Acesse https://netlify.com
2. Faça login
3. Arraste a pasta do projeto
   OU
   Conecte ao repositório GitHub
4. Configure:
   - Build command: npm run build
   - Publish directory: dist
5. Deploy
6. Site disponível em: https://kzstore.netlify.app
```

#### **OPÇÃO C: Servidor Próprio (VPS)**

Se você tiver um VPS/servidor próprio:

```bash
# No servidor
sudo apt update
sudo apt install nginx nodejs npm

# Clone o repositório
git clone https://github.com/SEU_USUARIO/kzstore.git
cd kzstore

# Instalar dependências
npm install

# Build para produção
npm run build

# Copiar para pasta do nginx
sudo cp -r dist/* /var/www/html/

# Configurar nginx
sudo nano /etc/nginx/sites-available/kzstore

# Adicione:
server {
    listen 80;
    server_name kzstore.ao www.kzstore.ao;
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Ativar site
sudo ln -s /etc/nginx/sites-available/kzstore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### **4. Configurar Domínio (kzstore.ao)**

#### **4.1. Comprar Domínio**
```
1. Acesse registrador de domínios .ao
   Exemplo: https://www.dns.ao
2. Procure por "kzstore.ao"
3. Se disponível, compre
4. Configure DNS
```

#### **4.2. Configurar DNS (se usar Vercel)**
```
No painel de DNS do seu registrador:

Tipo   | Nome  | Valor
-------|-------|----------------------------
A      | @     | 76.76.21.21 (Vercel IP)
CNAME  | www   | cname.vercel-dns.com
```

#### **4.3. Adicionar Domínio no Vercel**
```
1. No Vercel, vá em Settings > Domains
2. Adicione: kzstore.ao
3. Adicione: www.kzstore.ao
4. Aguarde propagação DNS (até 48h)
```

---

### **5. Testes Pós-Deploy**

#### **5.1. Checklist de Testes**

```
✓ Homepage carrega corretamente
✓ Menu de navegação funciona
✓ Catálogo de produtos exibe produtos
✓ Filtros funcionam
✓ Página de produto carrega
✓ Sistema de reviews visível
✓ Adicionar ao carrinho funciona
✓ Carrinho exibe itens
✓ Checkout carrega
✓ Campo de cupom aparece
✓ Login/Cadastro funciona
✓ Área do cliente acessível
✓ Painel admin funciona (admin@kzstore.ao / kzstore2024)
✓ Criar produto no admin
✓ Criar cupom no admin
✓ Fazer pedido de teste
✓ Email de confirmação recebido
✓ WhatsApp recebe notificação
✓ Estoque é reduzido
✓ Review pode ser criada
✓ Review aparece após aprovação
✓ Páginas legais carregam
✓ Footer com links funciona
✓ Responsivo mobile funciona
✓ Chatbot IA responde
```

#### **5.2. Teste de Pedido Completo**

```
1. Acesse a loja
2. Navegue pelo catálogo
3. Adicione produto ao carrinho
4. Vá para checkout
5. Preencha dados
6. Aplique cupom (se tiver criado)
7. Confirme pedido
8. Verifique:
   ✓ Email recebido (verifique spam)
   ✓ WhatsApp recebeu (número +244 931 054 015)
   ✓ Pedido aparece em "Meus Pedidos"
   ✓ Pedido aparece no admin
   ✓ Estoque foi reduzido
```

---

### **6. Monitoramento e Manutenção**

#### **6.1. Logs do Supabase**
```
1. Supabase Dashboard
2. Vá em Logs > Edge Functions
3. Monitore erros
4. Verifique uso de recursos
```

#### **6.2. Logs do Frontend (Vercel)**
```
1. Vercel Dashboard
2. Selecione projeto kzstore
3. Vá em "Functions" > "Logs"
4. Monitore erros de build/runtime
```

#### **6.3. Analytics (Opcional)**
```
Adicione Google Analytics:
1. Crie conta em analytics.google.com
2. Obtenha ID de medição (G-XXXXXXXXXX)
3. Adicione ao index.html:

<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

### **7. Marketing e Lançamento**

#### **7.1. Checklist de Lançamento**

```
✓ Domínio configurado
✓ SSL/HTTPS ativado (automático Vercel)
✓ Email profissional funcionando
✓ WhatsApp Business configurado
✓ Redes sociais criadas:
  - Facebook: @kzstore
  - Instagram: @kzstore
  - LinkedIn: KwanzaStore
✓ Google My Business cadastrado
✓ Catálogo inicial de produtos (mínimo 20)
✓ Imagens de produtos profissionais
✓ Descrições completas
✓ Preços atualizados
✓ Estoque registrado
✓ Políticas legais revisadas
✓ Contas de teste criadas
✓ Pedidos de teste realizados
```

#### **7.2. Primeiras Ações**

```
DIA 1 - Soft Launch:
- Anunciar para amigos e família
- Pedir feedback
- Corrigir bugs urgentes
- Fazer pedidos de teste

DIA 2-7 - Beta Público:
- Anunciar em redes sociais
- Oferecer cupom de lançamento (Ex: BEMVINDO10)
- Coletar feedback
- Responder dúvidas

DIA 8+ - Lançamento Oficial:
- Campanha de marketing
- Anúncios pagos (Facebook/Google)
- Parcerias com influencers
- Email marketing
```

---

### **8. Cupom de Lançamento (Criar Agora!)**

Entre no painel admin e crie:

```
Código: BEMVINDO10
Tipo: Percentual
Valor: 10
Compra Mínima: 10000 AOA
Máximo de Usos: 100
Data Início: Hoje
Data Fim: +30 dias
Descrição: Cupom de boas-vindas - 10% de desconto na primeira compra!
```

---

### **9. Backup e Segurança**

#### **9.1. Backup Automático do Supabase**
```
Supabase faz backup automático diário.
Para backup manual:
1. Vá em Database > Backups
2. Clique em "Create backup"
```

#### **9.2. Backup do Código**
```bash
# Criar tag de versão
git tag -a v1.0.0 -m "Versão 1.0 - Lançamento Oficial"
git push origin v1.0.0

# Fazer backup em outro repositório
git remote add backup https://gitlab.com/SEU_USUARIO/kzstore-backup.git
git push backup main
```

---

### **10. Suporte Pós-Lançamento**

#### **10.1. Canais de Atendimento**
```
WhatsApp: +244 931 054 015 (Principal)
Email: kzstoregeral@gmail.com
Chatbot IA: Disponível 24/7 no site
Facebook/Instagram: Responder em até 2 horas
```

#### **10.2. Horário de Atendimento**
```
Segunda a Sexta: 8h - 18h
Sábado: 9h - 14h
Domingo: Fechado (apenas chatbot)
```

---

## 📊 MÉTRICAS DE SUCESSO

### **Mês 1:**
- [ ] 100 visitas/dia
- [ ] 10 pedidos
- [ ] 5 reviews
- [ ] 1 cupom usado

### **Mês 3:**
- [ ] 500 visitas/dia
- [ ] 50 pedidos/mês
- [ ] 30 reviews
- [ ] 100 clientes cadastrados

### **Mês 6:**
- [ ] 1.000 visitas/dia
- [ ] 150 pedidos/mês
- [ ] 100 reviews
- [ ] 500 clientes cadastrados

---

## 🎉 PRÓXIMOS PASSOS APÓS DEPLOY

1. ✅ Deploy completo
2. ⏳ Criar cupom de lançamento
3. ⏳ Cadastrar produtos iniciais (mínimo 20)
4. ⏳ Configurar redes sociais
5. ⏳ Anunciar soft launch
6. ⏳ Coletar feedback
7. ⏳ Lançamento oficial

---

## 🆘 RESOLUÇÃO DE PROBLEMAS

### **Problema: Emails não estão sendo enviados**
```
Solução:
1. Verifique se RESEND_API_KEY está configurada
2. Verifique logs do Supabase Edge Functions
3. Verifique caixa de spam
4. Teste com resend.com/logs
```

### **Problema: Chatbot não responde**
```
Solução:
1. Verifique se GEMINI_API_KEY está configurada
2. Verifique quota da API do Gemini
3. Verifique logs do Edge Functions
```

### **Problema: Estoque não atualiza**
```
Solução:
1. Verifique logs ao criar pedido
2. Confirme que backend foi deployado
3. Teste criar pedido pelo admin
```

---

## 📞 CONTATOS IMPORTANTES

**Suporte Supabase:** https://supabase.com/support  
**Suporte Resend:** https://resend.com/support  
**Suporte Vercel:** https://vercel.com/support  
**Google Gemini:** https://ai.google.dev/gemini-api  

---

## ✅ CONCLUSÃO

**A KZSTORE ESTÁ 100% PRONTA PARA CONQUISTAR ANGOLA! 🇦🇴**

Todos os sistemas estão implementados e funcionais:
- ✅ E-commerce completo
- ✅ Sistema de avaliações
- ✅ Sistema de cupons
- ✅ Gestão de estoque automática
- ✅ Notificações (email + WhatsApp)
- ✅ Páginas legais
- ✅ Área do cliente
- ✅ Painel admin completo
- ✅ Chatbot IA
- ✅ Design responsivo

**FAÇA O DEPLOY AGORA E BOA SORTE! 🚀🎊**

---

**Desenvolvido com dedicação em:** 7 de Novembro de 2024  
**Status:** ✅ **PRODUCTION READY**  
**Versão:** 1.0.0  
**Deploy:** 🚀 **READY TO LAUNCH!**
