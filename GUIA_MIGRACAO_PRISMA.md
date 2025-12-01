# 📘 GUIA DE MIGRAÇÃO: SUPABASE → PRISMA + MYSQL

## ✅ O QUE JÁ FOI FEITO

### 1️⃣ Instalação
- ✅ Prisma CLI instalado
- ✅ Prisma Client instalado
- ✅ Driver MySQL2 instalado

### 2️⃣ Configuração
- ✅ Schema Prisma criado (`prisma/schema.prisma`)
- ✅ Arquivo `.env` configurado com `DATABASE_URL`
- ✅ Cliente Prisma centralizado (`src/utils/prisma/client.ts`)
- ✅ Helpers criados (`src/utils/prisma/helpers.ts`)
- ✅ Tipos atualizados em `src/types/index.ts`

### 3️⃣ Schema
Todas as 11 tabelas foram convertidas:
- ✅ Products
- ✅ Orders
- ✅ Reviews
- ✅ Coupons
- ✅ Price Alerts
- ✅ Flash Sales
- ✅ Customer Profiles
- ✅ Loyalty Accounts
- ✅ Loyalty History
- ✅ Stock History
- ✅ Analytics Events

---

## 🚀 PRÓXIMOS PASSOS

### PASSO 1: Configurar MySQL
```bash
# Instalar MySQL (se ainda não tiver)
# macOS:
brew install mysql
brew services start mysql

# Criar banco de dados
mysql -u root -p
CREATE DATABASE kzstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### PASSO 2: Atualizar .env
Edite `/Users/UTENTE1/Desktop/KZSTORE Online Shop-2/.env`:
```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/kzstore"
```

### PASSO 3: Executar Migrações
```bash
cd "/Users/UTENTE1/Desktop/KZSTORE Online Shop-2"

# Gerar Prisma Client
npx prisma generate

# Criar migração inicial
npx prisma migrate dev --name init

# (Ou se já tiver um banco com dados)
npx prisma db push
```

### PASSO 4: Verificar Schema
```bash
# Abrir Prisma Studio para visualizar
npx prisma studio
```

---

## 📝 ALTERAÇÕES NECESSÁRIAS NO CÓDIGO

### Importações a Mudar:
**Antes (Supabase):**
```typescript
import { getSupabaseClient } from './utils/supabase/client';
const supabase = getSupabaseClient();
```

**Depois (Prisma):**
```typescript
import { getPrismaClient } from './utils/prisma/client';
const prisma = getPrismaClient();
```

### Exemplos de Conversão de Queries:

#### BUSCAR PRODUTOS
**Antes (Supabase):**
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('ativo', true);
```

**Depois (Prisma):**
```typescript
const products = await prisma.product.findMany({
  where: { ativo: true }
});
```

#### CRIAR PRODUTO
**Antes (Supabase):**
```typescript
const { data, error } = await supabase
  .from('products')
  .insert([{ nome, preco_aoa, categoria }])
  .select();
```

**Depois (Prisma):**
```typescript
const product = await prisma.product.create({
  data: { nome, preco_aoa, categoria }
});
```

#### ATUALIZAR PRODUTO
**Antes (Supabase):**
```typescript
const { data, error } = await supabase
  .from('products')
  .update({ estoque: 10 })
  .eq('id', productId);
```

**Depois (Prisma):**
```typescript
const product = await prisma.product.update({
  where: { id: productId },
  data: { estoque: 10 }
});
```

#### DELETAR PRODUTO
**Antes (Supabase):**
```typescript
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId);
```

**Depois (Prisma):**
```typescript
await prisma.product.delete({
  where: { id: productId }
});
```

---

## 🔍 ARQUIVOS QUE PRECISAM SER ATUALIZADOS

### Backend (Prioridade Alta):
1. `src/supabase/functions/server/routes-v2.tsx` ⚠️
2. `src/supabase/functions/server/routes.tsx` ⚠️
3. `src/supabase/functions/server/supabase-helpers.tsx` ⚠️
4. `src/supabase/functions/server/advanced-features.tsx` ⚠️

### Hooks (Prioridade Média):
5. `src/hooks/useKZStore.ts` (se existir)
6. Outros hooks que fazem queries

### Componentes (Prioridade Baixa):
7. Componentes que fazem queries diretas
8. Admin panels

---

## ⚡ COMANDOS ÚTEIS

```bash
# Gerar Prisma Client após mudanças no schema
npx prisma generate

# Ver/editar dados no navegador
npx prisma studio

# Resetar banco (CUIDADO: apaga tudo!)
npx prisma migrate reset

# Ver status das migrações
npx prisma migrate status

# Formatar schema
npx prisma format
```

---

## 🎯 BENEFÍCIOS DA MIGRAÇÃO

1. ✅ **Type Safety**: Prisma gera tipos TypeScript automaticamente
2. ✅ **Performance**: Queries mais rápidas com MySQL otimizado
3. ✅ **Migrations**: Controle de versão do banco de dados
4. ✅ **Local Development**: Desenvolver offline sem Supabase
5. ✅ **Flexibilidade**: Pode usar qualquer host MySQL (não depende só do Supabase)
6. ✅ **Prisma Studio**: Interface visual para dados

---

## ⚠️ ATENÇÃO

### Migração Gradual (Recomendado):
1. Manter Supabase funcionando temporariamente
2. Migrar uma funcionalidade por vez
3. Testar cada migração antes de continuar
4. Quando tudo estiver pronto, remover código Supabase

### Backup:
```bash
# Fazer backup do banco Supabase antes
# Use o SQL Editor do Supabase Dashboard
```

---

## 📞 PRÓXIMA AÇÃO

**Execute agora:**
```bash
cd "/Users/UTENTE1/Desktop/KZSTORE Online Shop-2"

# 1. Configure sua senha do MySQL no .env
# 2. Execute:
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
```

Depois disso, podemos começar a migrar as rotas do backend! 🚀
