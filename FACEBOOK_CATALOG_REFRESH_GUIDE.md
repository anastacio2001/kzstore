# 📘 Guia: Como Atualizar o Catálogo no Facebook Commerce Manager

## 🔍 Problema
O Facebook Commerce Manager mostra "70 produtos" mas o feed XML tem **78 produtos** (verificado via API).

## ✅ Solução: Forçar Atualização do Cache do Facebook

### Método 1: Facebook Commerce Manager (Recomendado)

1. **Acesse o Facebook Commerce Manager**
   - URL: https://business.facebook.com/commerce
   - Faça login com sua conta administradora

2. **Vá para Data Sources (Fontes de Dados)**
   - No menu lateral esquerdo
   - Clique em "Data Sources" ou "Fontes de Dados"

3. **Encontre o Feed da KZSTORE**
   - Procure pela URL: `https://kzstore-backend.fly.dev/feed.xml`
   - Ou pelo nome do feed configurado

4. **Force a Atualização**
   - Clique nos **3 pontos (⋮)** ao lado do feed
   - Selecione **"Fetch Now"** ou **"Atualizar Agora"**
   - Aguarde alguns minutos para processamento

5. **Verifique os Resultados**
   - Atualize a página
   - Deve mostrar **78 produtos** ao invés de 70

---

### Método 2: Facebook Debugger Tool

1. **Acesse o Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/

2. **Cole a URL do Feed**
   ```
   https://kzstore-backend.fly.dev/feed.xml
   ```

3. **Clique em "Scrape Again" (Recarregar)**
   - Isso força o Facebook a buscar a versão mais recente

4. **Verifique os Dados**
   - O debugger mostrará informações sobre o feed
   - Confira se está pegando dados recentes

---

### Método 3: Aguardar Sincronização Automática

O Facebook sincroniza feeds automaticamente a cada **24 horas**.

**Agora com os novos headers de cache configurados:**
```http
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

O Facebook **não deve usar cache antigo** nas próximas sincronizações.

---

## 📊 Verificação Técnica

### Feed Atual (Confirmado via API)
```bash
curl -s "https://kzstore-backend.fly.dev/feed.xml" | grep -c "<item>"
```
**Resultado:** `78` produtos ✅

### Produtos Ativos no Banco
```bash
curl -s "https://kzstore-backend.fly.dev/api/products?limit=1000" | jq '.total'
```
**Resultado:** `77` produtos ativos ✅

**Nota:** Feed mostra 78 porque inclui 1 produto inativo (configuração pode ser ajustada se necessário).

---

## ⚙️ Configurações Aplicadas (Backend)

### Headers Anti-Cache (✅ Aplicados)
```typescript
// server.ts - Linha 5170
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');
res.setHeader('Last-Modified', new Date().toUTCString());
```

### Feed XML Completo
- ✅ Todos os 77 produtos ativos incluídos
- ✅ Campos obrigatórios: id, title, description, link, image_link, availability, price, brand
- ✅ Campos opcionais: condition (new), google_product_category

---

## 🆘 Problemas Persistentes?

### Se após 24h ainda mostrar 70 produtos:

1. **Verificar erros no Commerce Manager**
   - Vá para "Diagnostics" ou "Diagnósticos"
   - Veja se há produtos rejeitados

2. **Produtos podem estar rejeitados por:**
   - Falta de imagem válida
   - Preço fora do formato aceito
   - Descrição muito curta
   - Categoria não reconhecida

3. **Revalidar produtos individualmente:**
   - No Commerce Manager
   - Aba "Product Catalog"
   - Filtrar por "Rejected" ou "Rejeitados"
   - Corrigir os erros apontados

---

## 📞 Suporte

- **Backend:** https://kzstore-backend.fly.dev
- **Feed XML:** https://kzstore-backend.fly.dev/feed.xml
- **Frontend:** https://kzstore.ao

---

## ✅ Checklist Rápido

- [ ] Acessei o Facebook Commerce Manager
- [ ] Encontrei o feed da KZSTORE
- [ ] Cliquei em "Fetch Now" / "Atualizar Agora"
- [ ] Aguardei 5-10 minutos
- [ ] Atualizei a página do Commerce Manager
- [ ] Verifiquei que agora mostra 78 produtos (ou 77+)
- [ ] Produtos aparecem corretamente na loja Facebook

---

**Última Atualização:** 5 de Janeiro de 2025
**Status Backend:** ✅ Online e Funcionando
**Status Feed:** ✅ 78 produtos disponíveis
