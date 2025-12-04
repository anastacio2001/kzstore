# Guia Completo: Product Feeds - WhatsApp, Facebook & Google

## 📋 Visão Geral

Este guia explica como usar os feeds de produtos do KZStore para integrar com:
- ✅ **WhatsApp Business Catalog**
- ✅ **Facebook Commerce Manager**
- ✅ **Google Merchant Center**

---

## 🔗 Endpoints Disponíveis

### 1. `/feed.json` - JSON Feed
**Uso:** WhatsApp Business, Facebook Catalog  
**Formato:** JSON estruturado  
**URL:** `https://kzstore-341392738431.europe-southwest1.run.app/feed.json`

```json
{
  "title": "KZStore - Tech & Electronics",
  "link": "https://kzstore.ao",
  "description": "A maior loja online de produtos eletrônicos em Angola",
  "updated": "2025-12-04T12:00:00.000Z",
  "products": [
    {
      "id": "uuid",
      "title": "Pen Drive 32GB Venture USB 2.0",
      "description": "Pen drive compacto e rápido",
      "link": "https://kzstore.ao/produto/pen-drive-32gb-uuid",
      "image_link": "https://...",
      "price": "17250.00 AOA",
      "availability": "in stock",
      "condition": "new",
      "brand": "Venture",
      "gtin": "1234567890123",
      "mpn": "SKU-001"
    }
  ]
}
```

### 2. `/feed.xml` - Facebook XML Feed
**Uso:** Facebook Commerce Manager  
**Formato:** RSS 2.0 com namespace Google  
**URL:** `https://kzstore-341392738431.europe-southwest1.run.app/feed.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>KZStore - Tech &amp; Electronics</title>
    <link>https://kzstore.ao</link>
    <description>A maior loja online de produtos eletrônicos em Angola</description>
    <item>
      <g:id>uuid</g:id>
      <g:title>Pen Drive 32GB Venture USB 2.0</g:title>
      <g:description>Pen drive compacto e rápido</g:description>
      <g:link>https://kzstore.ao/produto/pen-drive-32gb-uuid</g:link>
      <g:image_link>https://...</g:image_link>
      <g:price>17250.00 AOA</g:price>
      <g:availability>in stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Venture</g:brand>
      <g:mpn>SKU-001</g:mpn>
      <g:google_product_category>1295</g:google_product_category>
    </item>
  </channel>
</rss>
```

### 3. `/google-feed.xml` - Google Merchant Feed
**Uso:** Google Merchant Center  
**Formato:** Atom com namespace Google  
**URL:** `https://kzstore-341392738431.europe-southwest1.run.app/google-feed.xml`

---

## 📱 1. WhatsApp Business Catalog

### Passo 1: Configurar WhatsApp Business
1. Acesse [WhatsApp Business Manager](https://business.facebook.com/)
2. Vá em **Settings → WhatsApp Manager**
3. Selecione sua conta WhatsApp Business

### Passo 2: Criar Catálogo
1. No menu lateral, clique em **Commerce Manager**
2. Clique em **Catalog → Create Catalog**
3. Selecione **E-commerce**
4. Escolha **Create manually or upload product info**

### Passo 3: Importar Feed
1. Vá em **Catalog → Data Sources → Add Items**
2. Selecione **Use data feed**
3. Configure:
   - **Feed Type:** Scheduled feed
   - **Feed URL:** `https://kzstore-341392738431.europe-southwest1.run.app/feed.json`
   - **Update frequency:** Daily
   - **Encoding:** UTF-8
4. Clique em **Start Upload**

### Passo 4: Conectar ao WhatsApp
1. Vá em **Commerce Manager → Settings**
2. Clique em **Add sales channel**
3. Selecione **WhatsApp**
4. Conecte sua conta WhatsApp Business
5. Ative **Product Catalog**

### Testando
- Abra WhatsApp Business no celular
- Vá em **Catálogo**
- Seus produtos devem aparecer automaticamente
- Compartilhe produtos com clientes via chat

---

## 📘 2. Facebook Commerce Manager

### Passo 1: Acessar Commerce Manager
1. Acesse [Facebook Commerce Manager](https://www.facebook.com/commerce_manager/)
2. Selecione sua Business Account
3. Clique em **Catalog**

### Passo 2: Criar Catálogo (se não existir)
1. Clique em **Create Catalog**
2. Selecione **E-commerce**
3. Digite nome: **KZStore Products**
4. Clique em **Create**

### Passo 3: Adicionar Data Feed
1. No seu catálogo, vá em **Data Sources**
2. Clique em **Add Items → Use Data Feed**
3. Configure:
   - **Feed Name:** KZStore Product Feed
   - **Schedule:** Daily at 3:00 AM
   - **Feed URL:** `https://kzstore-341392738431.europe-southwest1.run.app/feed.xml`
   - **Currency:** AOA
   - **Country:** Angola (AO)
   - **Language:** Portuguese (pt)
4. Clique em **Start Upload**

### 📝 Mapeamento de Campos (IMPORTANTE)

Quando o Facebook pedir para mapear campos, use estas configurações:

#### Campo: `availability` (Disponibilidade)
**Regras de mapeamento:**
- `"in_stock"` → `"in stock"`
- `"out_of_stock"` → `"out of stock"`
- `"backorder"` → `"out of stock"`
- `"preorder"` → `"in stock"`

**Configuração no Facebook:**
1. Clique em **"Ver"** ao lado do campo `availability`
2. Adicione as 4 regras acima
3. Clique em **"Salvar"**

#### Campo: `quantity_to_sell_on_facebook` (Quantidade)
**Mapeamento:**
- `quantity → quantity_to_sell_on_facebook`

**Nota:** Este campo mapeia automaticamente a quantidade de estoque do feed.

#### Outros Campos Automáticos
O Facebook mapeia automaticamente:
- ✅ `id` → ID do produto
- ✅ `title` → Nome do produto
- ✅ `description` → Descrição
- ✅ `link` → URL do produto
- ✅ `image_link` → Imagem principal
- ✅ `price` → Preço
- ✅ `brand` → Marca
- ✅ `gtin` → Código de barras
- ✅ `condition` → Estado (new/used)

### Passo 4: Validar Feed
1. Aguarde processamento (5-30 minutos)
2. Verifique **Data Feed Status**
3. Corrija erros apontados:
   - ❌ **Missing fields** → Adicione campos obrigatórios
   - ❌ **Invalid URLs** → Verifique links de imagens
   - ❌ **Incorrect format** → Valide XML

### Passo 5: Conectar Facebook Shop
1. Vá em **Commerce Manager → Shop**
2. Clique em **Add sales channel → Facebook**
3. Selecione sua Página do Facebook
4. Ative **Checkout on Facebook** (opcional)
5. Configure pagamento e envio

### Sincronização em Tempo Real (Opcional)
Use **Facebook Graph API** para atualizações instantâneas:

```bash
# Atualizar produto específico
curl -X POST "https://graph.facebook.com/v18.0/{catalog-id}/products" \
  -H "Authorization: Bearer {access-token}" \
  -d '{
    "id": "product-uuid",
    "name": "Pen Drive 32GB",
    "price": "17250 AOA",
    "availability": "in stock"
  }'
```

---

## 🔍 3. Google Merchant Center

### Passo 1: Criar Conta Merchant Center
1. Acesse [Google Merchant Center](https://merchants.google.com/)
2. Faça login com conta Google
3. Clique em **Get Started**
4. Complete informações da loja:
   - **Business name:** KZStore
   - **Country:** Angola
   - **Time zone:** Africa/Luanda
   - **Website:** https://kzstore.ao

### Passo 2: Verificar e Reivindicar Website
1. Vá em **Settings → Business information**
2. Clique em **Website → Claim URL**
3. Escolha método de verificação:
   - **HTML file upload** (recomendado)
   - **Meta tag**
   - **Google Analytics**
4. Complete verificação

### Passo 3: Configurar Feed
1. No menu, vá em **Products → Feeds**
2. Clique em **+** (Add feed)
3. Configure:
   - **Country of sale:** Angola
   - **Language:** Portuguese
   - **Feed name:** KZStore Product Feed
   - **Input method:** Scheduled fetch
4. Clique em **Continue**

### Passo 4: Adicionar Feed URL
1. Em **Primary feeds**, clique **+**
2. Configure:
   - **File name:** KZStore Feed
   - **Fetch schedule:** Daily at 2:00 AM
   - **Protocol:** HTTPS
   - **Fetch URL:** `https://kzstore-341392738431.europe-southwest1.run.app/google-feed.xml`
3. Clique em **Create feed**

### Passo 5: Processar e Validar
1. Clique em **Fetch now** para teste imediato
2. Aguarde processamento (5-60 minutos)
3. Verifique **Diagnostics** tab:
   - ✅ **Active:** Feed funcionando
   - ⚠️ **Warnings:** Otimizações sugeridas
   - ❌ **Errors:** Problemas críticos

### Erros Comuns e Soluções

#### ❌ Missing GTIN
**Problema:** Produtos sem código de barras  
**Solução:** Adicione `codigo_barras` no produto ou use `identifier_exists = false`

```xml
<g:identifier_exists>false</g:identifier_exists>
```

#### ❌ Invalid price format
**Problema:** Preço no formato errado  
**Solução:** Use formato `valor MOEDA` (ex: `17250.00 AOA`)

#### ❌ Image not accessible
**Problema:** Imagens não podem ser baixadas  
**Solução:** Verifique se URLs são HTTPS e acessíveis publicamente

### Passo 6: Conectar Google Ads (Opcional)
1. Vá em **Settings → Linked accounts**
2. Clique em **Link account** ao lado de Google Ads
3. Selecione conta Google Ads
4. Ative **Shopping campaigns**

---

## ⚙️ 4. Automação e Atualização

### Webhook Automático
Os feeds são atualizados automaticamente quando:
- ✅ Produto criado
- ✅ Produto editado
- ✅ Produto deletado
- ✅ Estoque atualizado

### CRON Job para Regeneração Periódica
Configure job diário para regenerar feeds:

**Cloud Scheduler (Google Cloud):**
```bash
gcloud scheduler jobs create http feed-regeneration \
  --location=europe-west1 \
  --schedule="0 2 * * *" \
  --uri="https://kzstore-341392738431.europe-southwest1.run.app/api/feeds/regenerate" \
  --http-method=POST \
  --headers="Authorization=Bearer YOUR_ADMIN_TOKEN"
```

**Manual via curl:**
```bash
curl -X POST https://kzstore-341392738431.europe-southwest1.run.app/api/feeds/regenerate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Graph API - Facebook Real-Time Sync
Para sincronização instantânea com Facebook:

```javascript
// Quando produto é criado/atualizado
const facebookCatalogId = 'YOUR_CATALOG_ID';
const accessToken = 'YOUR_ACCESS_TOKEN';

fetch(`https://graph.facebook.com/v18.0/${facebookCatalogId}/batch`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    requests: [{
      method: 'UPDATE',
      retailer_id: productId,
      data: {
        name: product.nome,
        price: product.preco_aoa + ' AOA',
        availability: product.estoque > 0 ? 'in stock' : 'out of stock'
      }
    }]
  })
});
```

---

## 📊 5. Monitoramento e Métricas

### Verificar Status dos Feeds
```bash
# Ver produtos no feed JSON
curl https://kzstore-341392738431.europe-southwest1.run.app/feed.json | jq '.products | length'

# Validar XML feed
curl https://kzstore-341392738431.europe-southwest1.run.app/feed.xml | xmllint --noout -
```

### Dashboard do Admin
Acesse painel admin → **Produtos** → **Feeds**:
- Total de produtos ativos
- Última atualização
- Links para feeds
- Botão de regeneração manual

---

## 🔧 6. Troubleshooting

### Problema: Feed retorna erro 500
**Solução:**
1. Verifique logs do servidor
2. Confirme que Prisma está conectado ao MySQL
3. Teste query: `SELECT COUNT(*) FROM products WHERE ativo = true`

### Problema: Facebook rejeita produtos
**Soluções:**
- Adicione `codigo_barras` (GTIN) aos produtos
- Use imagens em alta resolução (mínimo 500x500px)
- Preencha descrições com mais de 100 caracteres
- Adicione campo `marca` (brand)

### Problema: Google não aceita preço em AOA
**Solução:**
Google suporta AOA, mas verifique formato:
```xml
<g:price>17250.00 AOA</g:price>
```

### Problema: WhatsApp não mostra catálogo
**Soluções:**
1. Verifique se catálogo está aprovado no Commerce Manager
2. Confirme que WhatsApp Business está conectado
3. Teste compartilhar produto manualmente no app

---

## ✅ Checklist de Implementação

### Configuração Inicial
- [x] Endpoints criados (`/feed.json`, `/feed.xml`, `/google-feed.xml`)
- [x] Campos obrigatórios mapeados
- [ ] GTIN/código de barras adicionado aos produtos
- [ ] Imagens em alta resolução (mín 500x500px)
- [ ] Descrições completas (>100 caracteres)

### WhatsApp Business
- [ ] Conta WhatsApp Business criada
- [ ] Catálogo configurado no Commerce Manager
- [ ] Feed conectado ao catálogo
- [ ] Teste envio de produto via chat

### Facebook Commerce
- [ ] Catálogo criado no Commerce Manager
- [ ] Data feed configurado e validado
- [ ] Loja Facebook ativada (opcional)
- [ ] Teste compra via Facebook

### Google Merchant Center
- [ ] Conta Merchant Center criada
- [ ] Website verificado e reivindicado
- [ ] Feed configurado e validado
- [ ] Produtos aprovados (sem erros críticos)
- [ ] Google Shopping Ads ativado (opcional)

### Automação
- [x] Webhook de atualização implementado
- [ ] CRON job configurado (atualização diária)
- [ ] Facebook Graph API integrada (opcional)
- [ ] Monitoramento de erros configurado

---

## 📞 Suporte

**Problemas com feeds?**
- Email: suporte@kzstore.ao
- WhatsApp: +244 XXX XXX XXX

**Documentação oficial:**
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Facebook Commerce Manager](https://www.facebook.com/business/help/commerce-manager)
- [Google Merchant Center](https://support.google.com/merchants/)

---

**Última atualização:** 4 de dezembro de 2025  
**Versão:** 1.0.0
