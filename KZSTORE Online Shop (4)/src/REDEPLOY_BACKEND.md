# 🚀 RE-DEPLOY DO BACKEND (INCLUIR ROTAS DE TICKETS)

## ⚠️ PROBLEMA ATUAL
As rotas de tickets (`/tickets/*`) estão retornando **404 Not Found** porque o código está no repositório, mas **não foi deployado no Supabase** ainda.

## ✅ SOLUÇÃO: RE-DEPLOY DA EDGE FUNCTION

### OPÇÃO 1: Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI (se ainda não tem)
npm install -g supabase

# 2. Login no Supabase
supabase login

# 3. Link com o projeto
supabase link --project-ref duxeeawfyxcciwlyjllk

# 4. Deploy da função server (que contém todas as rotas)
cd "KZSTORE Online Shop (4)/src/supabase/functions"
supabase functions deploy server --no-verify-jwt

# 5. Verificar deploy
supabase functions list
```

---

### OPÇÃO 2: GitHub + Supabase Integration (Automático)

Se você já tem integração GitHub → Supabase:

1. **Commit e Push** das mudanças:
   ```bash
   git add .
   git commit -m "Add ticket routes to backend"
   git push origin main
   ```

2. **Aguardar deploy automático** (2-3 minutos)
   - Acesse: https://supabase.com/dashboard/project/duxeeawfyxcciwlyjllk/functions
   - Verifique se a função `server` foi atualizada

---

### OPÇÃO 3: Dashboard Supabase (Manual)

1. Acesse: https://supabase.com/dashboard/project/duxeeawfyxcciwlyjllk/functions
2. Clique na função **`server`** ou **`make-server-d8a4dffd`**
3. Clique em **"Update Function"** ou **"Redeploy"**
4. Cole o conteúdo atualizado do arquivo:
   - `/supabase/functions/server/index.tsx`
   - `/supabase/functions/server/routes.tsx` 
   - `/supabase/functions/server/ticket-routes.tsx`
   - `/supabase/functions/server/middleware.tsx`

---

## 🔍 VERIFICAR SE DEU CERTO

Após o deploy, teste no navegador:

```bash
# Deve retornar 401 (não 404!) porque precisa estar autenticado
curl https://duxeeawfyxcciwlyjllk.supabase.co/functions/v1/make-server-d8a4dffd/tickets/my-tickets
```

**Resultado esperado:**
- ❌ ANTES: `404 Not Found`
- ✅ DEPOIS: `401 Unauthorized` (rota existe, mas precisa de autenticação)

---

## 📋 ARQUIVOS QUE PRECISAM ESTAR NO DEPLOY

```
/supabase/functions/server/
├── index.tsx          ✅ (tem app.route('/tickets', ticketRoutes))
├── routes.tsx         ✅ (tem export { ticketRoutes })
├── ticket-routes.tsx  ✅ (tem as 9 rotas de tickets)
├── middleware.tsx     ✅ (tem requireAuthUser)
└── deno.json         (configuração Deno)
```

---

## 🎯 DEPOIS DO DEPLOY

1. **Recarregue o navegador** (Ctrl+Shift+R)
2. **Faça login novamente**
3. **Tente criar um ticket**
4. ✅ **Deve funcionar!**

---

## 💡 DICA

Se você não tem Supabase CLI instalado e não tem integração GitHub, a forma mais rápida é:

1. **Zipar a pasta** `/supabase/functions/server/`
2. **Ir no Dashboard** do Supabase
3. **Upload do novo código** da função
4. **Aguardar deploy** (1-2 minutos)

---

## ❓ AINDA COM DÚVIDA?

Me diga qual método você usa para fazer deploy (CLI, GitHub, Dashboard) que eu te ajudo com os comandos específicos!
