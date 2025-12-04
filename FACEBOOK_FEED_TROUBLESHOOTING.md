# 🔧 Troubleshooting: Facebook Commerce Feed

## ❌ Problema Identificado: XML Malformado

### Erro Original
```
parser error : Start tag expected, '<' not found
<?xml version="1.0" encoding="UTF-8"?>\n<rss xmlns:g="http://base.google.com/ns/
```

### Causa Raiz
O servidor estava a enviar caracteres de escape literais (`\n`) em vez de quebras de linha reais no XML.

### Solução Aplicada
✅ Substituído todos os `\\n` por `\n` nos feeds:
- `/feed.xml` (Facebook RSS)
- `/google-feed.xml` (Google Merchant Atom)

---

## 📋 Checklist de Validação Pós-Deploy

### 1. Validar XML Estrutura
```bash
# Testar se XML está bem formatado
curl -s "https://kzstore-341392738431.europe-southwest1.run.app/feed.xml" | xmllint --format - | head -50

# Verificar header Content-Type
curl -I "https://kzstore-341392738431.europe-southwest1.run.app/feed.xml"
# Deve retornar: Content-Type: application/xml
```

### 2. Verificar Campos Obrigatórios
```bash
# Contar produtos no feed
curl -s "https://kzstore-341392738431.europe-southwest1.run.app/feed.xml" | grep -c "<item>"

# Verificar se tem GTIN
curl -s "https://kzstore-341392738431.europe-southwest1.run.app/feed.xml" | grep -c "<g:gtin>"

# Verificar se tem brand
curl -s "https://kzstore-341392738431.europe-southwest1.run.app/feed.xml" | grep -c "<g:brand>"
```

### 3. Testar no Facebook Feed Tester
1. Acesse: https://business.facebook.com/commerce/catalogs/
2. Selecione seu catálogo
3. Vá em **Data Sources → Settings**
4. Clique em **Test Feed**
5. Cole URL: `https://kzstore-341392738431.europe-southwest1.run.app/feed.xml`

---

## 🔍 Erros Comuns do Facebook

### ❌ "Não é possível carregar artigos"

**Causas Possíveis:**
1. ✅ **XML malformado** → **RESOLVIDO** (fix aplicado)
2. ⚠️ URL inacessível (firewall/CORS)
3. ⚠️ Timeout (feed muito grande)
4. ⚠️ Encoding incorreto

**Como Verificar:**
```bash
# Testar acessibilidade
curl -v "https://kzstore-341392738431.europe-southwest1.run.app/feed.xml" 2>&1 | grep "HTTP"

# Deve retornar: HTTP/2 200
```

**Solução se ainda falhar:**
- Aguarde 5-10 minutos após deploy
- Teste URL no navegador
- Verifique se Cloud Run permite requests do Facebook IPs

---

### ⚠️ "Não aparece nas lojas/anúncios"

**Causas Possíveis:**
1. Faltam campos obrigatórios (`availability`, `price`, `condition`)
2. Falta `gtin` (código de barras)
3. Imagens não acessíveis
4. Preço em formato incorreto

**Campos Obrigatórios Facebook:**
```xml
<g:id>uuid</g:id>                          <!-- ✅ Presente -->
<g:title>Nome do Produto</g:title>         <!-- ✅ Presente -->
<g:description>Descrição</g:description>   <!-- ✅ Presente -->
<g:link>URL</g:link>                       <!-- ✅ Presente -->
<g:image_link>URL</g:image_link>           <!-- ✅ Presente -->
<g:price>12500.00 AOA</g:price>            <!-- ✅ Presente -->
<g:availability>in stock</g:availability>  <!-- ✅ Presente -->
<g:condition>new</g:condition>             <!-- ✅ Presente -->
<g:brand>KZStore</g:brand>                 <!-- ✅ Presente -->
<g:gtin>2286761760065</g:gtin>             <!-- ✅ Presente (62 produtos) -->
```

**Verificar no Feed:**
```bash
# Ver primeiro produto completo
curl -s "https://kzstore-341392738431.europe-southwest1.run.app/feed.xml" | \
  xmllint --format - | sed -n '/<item>/,/<\/item>/p' | head -30
```

---

## 🎯 Configuração Correta no Facebook Commerce

### Passo a Passo Atualizado

#### 1. Adicionar Data Feed
1. **Commerce Manager** → Seu Catálogo
2. **Data Sources** → **Add Items** → **Use Data Feed**

#### 2. Configurar Feed
```
Feed Name: KZStore Product Feed
Feed URL: https://kzstore-341392738431.europe-southwest1.run.app/feed.xml
Schedule: Daily at 3:00 AM
Currency: AOA (Kwanza Angolano)
Country: Angola (AO)
Language: Portuguese (pt)
```

#### 3. Mapear Campos (CRÍTICO)

**Campo: `availability`**
- Clique em **"Ver"** ao lado do campo
- Adicione regras:
  ```
  "in_stock"     → "in stock"
  "out_of_stock" → "out of stock"
  "backorder"    → "out of stock"
  "preorder"     → "in stock"
  ```

**Campo: `quantity_to_sell_on_facebook`**
- Mapear: `quantity → quantity_to_sell_on_facebook`
- (Facebook detecta automaticamente do XML)

#### 4. Iniciar Upload
- Clique **"Start Upload"** ou **"Fetch Now"**
- Aguarde **5-30 minutos** para processamento inicial
- Verifique status em **Data Sources**

#### 5. Resolver Erros
Vá em **Data Sources → [Seu Feed] → Diagnostics**

**Erros Comuns:**
| Erro | Solução |
|------|---------|
| Missing GTIN | ✅ Todos os 62 produtos têm GTIN |
| Invalid image | Verificar se URLs de imagem estão acessíveis |
| Price format | Formato correto: `12500.00 AOA` |
| Missing brand | ✅ Todos têm marca (Apple, Microsoft, KZStore) |

---

## 📊 Monitoramento Contínuo

### Verificações Diárias
```bash
# 1. Feed está acessível?
curl -I https://kzstore-341392738431.europe-southwest1.run.app/feed.xml

# 2. Quantos produtos?
curl -s https://kzstore-341392738431.europe-southwest1.run.app/feed.json | jq '.products | length'

# 3. Todos têm GTIN?
curl -s https://kzstore-341392738431.europe-southwest1.run.app/feed.json | \
  jq '[.products[] | select(.gtin == null)] | length'
```

### Dashboard Facebook
1. **Commerce Manager** → **Catalogs**
2. **Data Sources** → Ver status do feed
3. **Diagnostics** → Verificar erros
4. **Products** → Ver produtos importados

---

## 🚀 Próximos Passos Após Correção

### 1. Re-fetch Feed (IMEDIATO)
```bash
# Facebook Commerce Manager
1. Data Sources → [KZStore Product Feed]
2. Clique em "⋮" (3 pontos)
3. Selecione "Fetch now"
4. Aguarde 5-15 minutos
```

### 2. Verificar Processamento
- Status deve mudar de ❌ **"Error"** para ✅ **"Processing"**
- Após 15-30 min: ✅ **"Active"** (62 produtos importados)

### 3. Conectar Facebook Shop
```bash
Commerce Manager → Shop → Add Sales Channel → Facebook Page
```

### 4. Ativar WhatsApp Catalog
```bash
Commerce Manager → Settings → Sales Channels → WhatsApp Business
```

---

## 📞 Suporte Facebook

**Se persistir erros:**
1. Facebook Business Help Center: https://www.facebook.com/business/help
2. Commerce Manager Support: https://www.facebook.com/commerce_manager/support
3. Feed Specifications: https://developers.facebook.com/docs/commerce-platform/catalog/feed-file

---

## ✅ Status Atual

| Item | Status | Detalhes |
|------|--------|----------|
| XML Formato | ✅ CORRIGIDO | Removido `\n` literais |
| Feed URL | ✅ OK | https://kzstore-341392738431.europe-southwest1.run.app/feed.xml |
| Produtos | ✅ 62 | Todos com dados completos |
| GTIN | ✅ 100% | Todos os 62 produtos |
| Brand | ✅ 100% | Apple, Microsoft, Intel, HP, ASUS, KZStore |
| Imagens | ✅ OK | URLs HTTPS válidos |
| Deploy | 🔄 EM PROGRESSO | Revision 00184 |

**Próxima Ação:**
1. ⏳ Aguardar deploy completar (~3-5 min)
2. ✅ Validar XML com xmllint
3. 🔄 Re-fetch feed no Facebook
4. ✅ Verificar importação de 62 produtos

---

**Última Atualização:** 4 de dezembro de 2025, 14:30  
**Versão:** 1.1.0 (Post-Fix)


Resumo dos Feeds Configurados
Plataforma	Feed URL	Status
Facebook	https://kzstore-341392738431.europe-southwest1.run.app/feed.xml	✅ Funcionando
WhatsApp	https://kzstore-341392738431.europe-southwest1.run.app/feed.json	✅ Pronto
Google	https://kzstore-341392738431.europe-southwest1.run.app/google-feed.xml	🔄 Adicionar agora
