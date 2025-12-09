# 🎯 TikTok Pixel - Guia de Eventos Implementados

**Data:** 7 de dezembro de 2025  
**Pixel ID:** D4QLH33C77U0596TKJ7G  
**Nome do Pixel:** kzstore_ao  
**Access Token:** 355aa33cfc9cef01260dcf6f07cb8a1bccb81808

---

## 📊 Eventos Implementados

### ✅ 1. ViewContent (Visualização de Produto)
**Quando é disparado:**
- Usuário clica em um produto e visualiza a página de detalhes

**Dados rastreados:**
- ID do produto
- Nome do produto
- Preço (AOA)
- Categoria
- Descrição

**Arquivo:** `src/App.tsx` (função `viewProductDetail`)

---

### ✅ 2. AddToCart (Adicionar ao Carrinho)
**Quando é disparado:**
- Usuário adiciona um produto ao carrinho

**Dados rastreados:**
- ID do produto
- Nome do produto
- Preço (AOA)
- Categoria
- Quantidade
- Valor total (preço × quantidade)

**Arquivo:** `src/App.tsx` (função `addToCart`)

**Observação:** Inclui suporte para Flash Sales (preços com desconto)

---

### ✅ 3. AddToWishlist (Adicionar aos Favoritos)
**Quando é disparado:**
- Usuário adiciona um produto à lista de desejos/favoritos

**Dados rastreados:**
- ID do produto
- Nome do produto
- Preço (AOA)

**Arquivo:** `src/hooks/useWishlist.tsx` (função `addToWishlist`)

**Observação:** Funciona tanto para usuários logados (API) quanto não logados (localStorage)

---

### ✅ 4. Search (Busca de Produtos)
**Quando é disparado:**
- Usuário digita no campo de busca (mínimo 3 caracteres)
- Com debounce de 1 segundo (aguarda usuário parar de digitar)

**Dados rastreados:**
- Termo de busca (query)
- Tipo de conteúdo: "product"

**Arquivo:** `src/hooks/useProductSearch.tsx` (useEffect)

---

### ✅ 5. InitiateCheckout (Iniciar Checkout)
**Quando é disparado:**
- Usuário clica no botão "Finalizar Compra" no carrinho

**Dados rastreados:**
- IDs dos produtos (separados por vírgula)
- Nomes dos produtos
- Valor total do carrinho
- Quantidade total de itens

**Arquivo:** `src/App.tsx` (callback do botão onCheckout)

---

### ✅ 6. PlaceAnOrder (Fazer Pedido)
**Quando é disparado:**
- Pedido é criado com sucesso (antes da confirmação de pagamento)

**Dados rastreados:**
- Número do pedido
- IDs dos produtos
- Nomes dos produtos
- Valor total (incluindo frete e descontos)

**Arquivo:** `src/components/CheckoutPage.tsx` (função `handleConfirmPayment`)

---

### ✅ 7. CompletePayment/Purchase (Compra Concluída)
**Quando é disparado:**
- Pedido é criado com sucesso (conversão final)

**Dados rastreados:**
- Número do pedido
- IDs dos produtos
- Nomes dos produtos
- Valor total (incluindo frete e descontos)

**Arquivo:** `src/components/CheckoutPage.tsx` (função `handleConfirmPayment`)

**⚠️ IMPORTANTE:** Este é o evento de conversão principal para anúncios do TikTok!

---

## 🛠️ Arquivos Criados/Modificados

### Novo Arquivo: `src/utils/tiktok-events.ts`
Classe utilitária centralizada para gerenciar todos os eventos do TikTok Pixel:
- Valida se o pixel está carregado
- Formata dados automaticamente
- Fornece logging detalhado no console
- Define currency como "AOA" automaticamente

### Modificações:
1. **src/App.tsx**
   - Import do `tiktokEvents`
   - Evento `addToCart` com rastreamento
   - Evento `viewProductDetail` com rastreamento
   - Evento `initiateCheckout` ao clicar em "Finalizar Compra"

2. **src/components/CheckoutPage.tsx**
   - Import do `tiktokEvents`
   - Evento `placeAnOrder` após criar pedido
   - Evento `completePurchase` (conversão)

3. **src/hooks/useProductSearch.tsx**
   - Import do `tiktokEvents`
   - Evento `search` com debounce de 1 segundo

4. **src/hooks/useWishlist.tsx**
   - Import do `tiktokEvents`
   - Evento `addToWishlist` (usuários logados e não logados)

---

## 🧪 Como Testar

### 1. Console do Navegador
Abra o console (F12) e execute:
```javascript
console.log(window.ttq); // Deve retornar objeto TikTok
```

### 2. Testar Eventos Manualmente
```javascript
// ViewContent
window.ttq.track('ViewContent', { content_id: 'test', value: 100, currency: 'AOA' });

// AddToCart
window.ttq.track('AddToCart', { content_id: 'test', value: 100, currency: 'AOA' });
```

### 3. Network Tab
- Abra DevTools → Network
- Filtre por "tiktok" ou "analytics.tiktok.com"
- Execute ações no site
- Verifique requests sendo enviados

### 4. TikTok Events Manager
1. Acesse: https://ads.tiktok.com
2. Menu: **Assets** → **Events**
3. Selecione o pixel **kzstore_ao**
4. Verifique:
   - Status do pixel (deve estar "Active")
   - Eventos recentes (gráfico em tempo real)
   - Test Events (se configurado)

---

## 📈 Verificação no TikTok Ads Manager

### Passo a Passo:
1. **Login:** https://ads.tiktok.com
2. **Navegar:** Assets → Events → kzstore_ao
3. **Verificar Status:**
   - ✅ Active (pixel carregando corretamente)
   - ⏳ Recent Activity (últimas 24h)
   - 📊 Event Data (gráfico de eventos)

### Métricas Importantes:
- **PageView:** Deve incrementar a cada página visitada
- **ViewContent:** Cada produto visualizado
- **AddToCart:** Cada produto adicionado ao carrinho
- **InitiateCheckout:** Cada vez que usuário inicia checkout
- **CompletePayment:** Cada pedido finalizado (CONVERSÃO)

---

## 🚨 Troubleshooting

### Problema: Pixel não está detectando eventos
**Solução:**
1. Limpe o cache do navegador
2. Verifique se o script do TikTok está carregando em `index.html`
3. Aguarde até 24-48h para o TikTok processar os dados iniciais

### Problema: "Impossibile trovare il codice base del pixel"
**Causa:** TikTok precisa de tempo para detectar o pixel após instalação
**Solução:** 
- Aguarde 24-48 horas
- Execute algumas ações no site (adicionar ao carrinho, fazer compras)
- Verifique se eventos estão sendo disparados no console

### Problema: Eventos não aparecem no TikTok Ads Manager
**Verificação:**
1. Console do navegador: `window.ttq` deve estar definido
2. Network tab: deve haver requests para `analytics.tiktok.com`
3. Verifique se há bloqueadores de anúncios ativos

---

## 🎯 Próximos Passos

### 1. Configurar Campanhas
- Criar campanhas no TikTok Ads Manager
- Definir objetivo: **Website Conversions**
- Selecionar evento de otimização: **CompletePayment**

### 2. API de Eventos (Server-Side)
Para maior precisão, considere implementar eventos server-side:
- Endpoint: `https://business-api.tiktok.com/open_api/v1.3/event/track/`
- Método: POST
- Token: 355aa33cfc9cef01260dcf6f07cb8a1bccb81808

### 3. Enhanced Measurement
Adicionar parâmetros avançados:
- Email do cliente (hash SHA-256)
- Telefone do cliente (hash SHA-256)
- external_id (user ID)
- IP do cliente
- User agent

---

## 📝 Notas Importantes

1. **Moeda:** Todos os eventos usam "AOA" (Kwanza Angolano)
2. **IDs únicos:** Cada produto tem UUID único do banco de dados
3. **Debounce:** Eventos de busca têm delay de 1s para evitar spam
4. **Console Logging:** Todos os eventos são logados no console (desenvolvimento)
5. **Conversão Principal:** `CompletePayment` = pedido finalizado com sucesso

---

## 🔗 Links Úteis

- **TikTok Ads Manager:** https://ads.tiktok.com
- **TikTok Events Manager:** https://ads.tiktok.com/i18n/events
- **Documentação Oficial:** https://ads.tiktok.com/marketing_api/docs?id=1739584855420929
- **Payload Helper:** https://ads.tiktok.com/marketing_api/docs?id=1701890979375106

---

## ✅ Status Final

**Data de Implementação:** 7 de dezembro de 2025  
**Status:** ✅ Completo e em produção  
**Eventos Ativos:** 7/7  
**Integração:** Client-side (Browser Pixel)

**Próxima Revisão:** 14 de dezembro de 2025 (verificar métricas após 7 dias)
