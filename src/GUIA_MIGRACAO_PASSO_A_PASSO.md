# 🎯 GUIA DE MIGRAÇÃO: KV STORE → SUPABASE (Passo a Passo)

## ✅ O QUE JÁ FOI FEITO

1. ✅ **Orders** - Tabela criada e totalmente migrada
2. ✅ **Products Service** - Arquivo `/services/productsService.ts` criado
3. ✅ **SQL Script** - Arquivo `/SQL_CRIAR_TABELAS_MIGRACAO.sql` criado
4. ✅ **Análise Completa** - Identificadas todas as 102+ ocorrências do KV Store

---

## 🚀 PASSO 1: CRIAR TABELAS NO SUPABASE

### 1.1 Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Entre no seu projeto KZSTORE
- Clique em **SQL Editor** (ícone de raio no menu lateral)

### 1.2 Execute o Script SQL
- Clique em **+ New Query**
- Copie TODO o conteúdo do arquivo `/SQL_CRIAR_TABELAS_MIGRACAO.sql`
- Cole no editor
- Clique em **RUN** (ou pressione Ctrl+Enter)

### 1.3 Verificar Criação
Você deve ver uma mensagem de sucesso e uma lista de tabelas criadas:
```
analytics_events
coupons
customer_profiles
flash_sales
loyalty_accounts
loyalty_history
price_alerts
products
reviews
stock_history
```

---

## 🔧 PASSO 2: MIGRAR ROTAS DO SERVIDOR (Em Progresso)

Eu já comecei a migração das rotas no arquivo `/supabase/functions/server/routes.tsx`.

### O Que Já Foi Migrado:
- ✅ `GET /products` - Agora busca do Supabase

### O Que Ainda Precisa Ser Migrado:

#### Products (ALTA PRIORIDADE)
- 🔄 `POST /products/initialize` - Inicializar produtos
- 🔄 `GET /products/:id` - Buscar produto por ID
- 🔄 `POST /products` - Criar produto
- 🔄 `PUT /products/:id` - Atualizar produto
- 🔄 `DELETE /products/:id` - Deletar produto
- 🔄 `GET /products/alerts/low-stock` - Produtos com estoque baixo
- 🔄 `GET /products/:id/stock-history` - Histórico de estoque

#### Reviews (MÉDIA PRIORIDADE)
- 🔄 `GET /reviews/product/:productId`
- 🔄 `POST /reviews`
- 🔄 `PATCH /reviews/:id/status`
- 🔄 `DELETE /reviews/:id`

#### Coupons (MÉDIA PRIORIDADE)
- 🔄 `GET /coupons`
- 🔄 `GET /coupons/validate/:code`
- 🔄 `POST /coupons`
- 🔄 `PUT /coupons/:id`
- 🔄 `DELETE /coupons/:id`

#### Customers (ALTA PRIORIDADE)
- 🔄 `POST /auth/setup-admin`
- 🔄 `POST /auth/signup`
- 🔄 `GET /customers`

---

## 📊 PASSO 3: TESTAR A MIGRAÇÃO

### 3.1 Verificar Produtos
1. Abra a aplicação KZSTORE no navegador
2. Vá para a página de produtos
3. Verifique se os produtos estão aparecendo
4. Abra o Console do navegador (F12) e verifique se há erros

### 3.2 Criar Um Produto de Teste (Admin)
1. Faça login como admin
2. Vá para o Painel Administrativo
3. Tente criar um novo produto
4. Verifique se ele aparece na lista

### 3.3 Verificar no Supabase
1. Vá para **Supabase Dashboard → Table Editor**
2. Clique na tabela **products**
3. Verifique se os produtos estão salvos corretamente

---

## 🔥 PROBLEMAS COMUNS E SOLUÇÕES

### Erro: "relation 'products' does not exist"
**Solução:** Você precisa executar o script SQL do Passo 1.

### Erro: "column 'X' does not exist"
**Solução:** A tabela foi criada com estrutura antiga. Delete a tabela e crie novamente com o script atualizado.

```sql
DROP TABLE IF EXISTS products CASCADE;
-- Depois execute o script SQL_CRIAR_TABELAS_MIGRACAO.sql novamente
```

### Produtos não aparecem na aplicação
**Solução:** 
1. Abra o Console do navegador (F12)
2. Vá para a aba Network
3. Recarregue a página
4. Verifique se a chamada para `/make-server-d8a4dffd/products` retorna dados
5. Se retornar vazio, os produtos ainda não foram migrados do KV Store

---

## 📦 PASSO 4: MIGRAR DADOS DO KV STORE (OPCIONAL)

Se você tem produtos salvos no KV Store e quer migrá-los para o Supabase:

### 4.1 Exportar Produtos do KV Store
Abra o Console do navegador (F12) na aplicação e execute:

```javascript
async function exportarProdutosKV() {
  const projectId = 'SEU_PROJECT_ID'; // Substitua
  const publicAnonKey = 'SUA_ANON_KEY'; // Substitua
  
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/kv/prefix?prefix=product:`,
    {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  console.log('Produtos no KV Store:', data);
  
  // Copiar para clipboard
  copy(JSON.stringify(data, null, 2));
  console.log('✅ Produtos copiados! Cole em um editor de texto.');
}

exportarProdutosKV();
```

### 4.2 Importar para Supabase
No **Supabase Dashboard → SQL Editor**, execute:

```sql
-- Substituir os dados abaixo pelos produtos exportados
INSERT INTO products (id, nome, descricao, preco_aoa, categoria, estoque, imagem_url, created_at)
VALUES
  ('produto-1', 'Nome do Produto', 'Descrição', 50000, 'Categoria', 10, 'https://...', NOW()),
  -- Adicione mais produtos aqui
  ('produto-n', 'Outro Produto', 'Descrição', 75000, 'Categoria', 5, 'https://...', NOW());
```

Ou use uma ferramenta de importação CSV:
1. Salve os produtos em um arquivo CSV
2. Vá para **Table Editor → products**
3. Clique em **Insert → CSV**
4. Selecione o arquivo

---

## 📈 PROGRESSO DA MIGRAÇÃO

### Status Geral: 🟡 30% Completo

| Entidade | Status | Prioridade | Progresso |
|----------|--------|------------|-----------|
| Orders | ✅ Completo | Alta | 100% |
| Products | 🔄 Em Progresso | Alta | 30% |
| Customers | ⏳ Pendente | Alta | 0% |
| Reviews | ⏳ Pendente | Média | 0% |
| Coupons | ⏳ Pendente | Média | 0% |
| Price Alerts | ⏳ Pendente | Média | 0% |
| Loyalty | ⏳ Pendente | Baixa | 0% |
| Flash Sales | ⏳ Pendente | Baixa | 0% |
| Stock History | ⏳ Pendente | Baixa | 0% |
| Analytics | ⏳ Pendente | Baixa | 0% |

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### Para Você (Usuário):
1. **Execute o SQL** do Passo 1 no Supabase Dashboard
2. **Teste a aplicação** para ver se os produtos aparecem
3. **Reporte qualquer erro** que aparecer no console

### Para Mim (AI):
1. **Continuar migrando** as rotas de Products
2. **Migrar** as rotas de Customers
3. **Migrar** as rotas de Reviews e Coupons
4. **Criar serviços** para cada entidade
5. **Remover** dependências do KV Store
6. **Testar** cada funcionalidade migrada

---

## 💬 PRECISA DE AJUDA?

Se encontrar algum erro durante a migração, me mostre:
1. A mensagem de erro completa
2. O que você estava tentando fazer
3. Logs do Console do navegador (F12)
4. Logs do Supabase Functions (se houver)

**Importante:** NÃO apague dados do KV Store até confirmar que tudo está funcionando no Supabase!

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Após executar o Passo 1 (SQL), marque:

- [ ] SQL executado sem erros
- [ ] 10 tabelas criadas com sucesso
- [ ] Aplicação ainda funciona (sem quebrar)
- [ ] Posso ver os logs no console do navegador
- [ ] Estou pronto para continuar a migração

---

**Última Atualização:** 22 de Novembro de 2024  
**Status:** 🟡 Migração em Progresso
