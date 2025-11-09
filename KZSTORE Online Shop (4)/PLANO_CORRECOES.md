# 🔧 PLANO DE CORREÇÕES - KZSTORE

## 📋 PROBLEMAS IDENTIFICADOS

### 1️⃣ **Cupons no Checkout** (PARCIALMENTE CORRIGIDO)
- ✅ Cálculo do desconto corrigido
- ❌ Falta adicionar handlers `onCouponApply` e `onCouponRemove`
- ❌ Falta renderizar o componente `<CouponInput>` na página

### 2️⃣ **Gestão de Avaliações no Admin**
- ❌ ReviewManagement pode estar usando Edge Function inexistente

### 3️⃣ **Esqueceu Senha**
- ❌ Funcionalidade não existe

### 4️⃣ **Admin Panel - Anúncios**
- ❌ Criação não funciona (provavelmente API incorreta)
- ❌ Upload de imagens: só tem URL, precisa upload local + múltiplas imagens

### 5️⃣ **Admin Panel - Equipe**
- ❌ Adicionar membros não funciona (provavelmente API incorreta)

### 6️⃣ **Admin Panel - Sincronização de Usuários**
- ❌ Não funciona (API incorreta)

### 7️⃣ **Criar Pedido não funciona**
- ❌ Erro ao criar pedido (verificar causa)

---

## 🎯 CAUSA RAIZ

**TODOS os problemas têm a mesma causa:**
Componentes tentando usar **Edge Functions que não existem** em `/functions/v1/make-server-d8a4dffd/*`

**Solução:** Usar **API REST do Supabase** diretamente (`/rest/v1/tabela`)

---

## 🔄 CORREÇÕES A FAZER (Por Ordem de Prioridade)

### **FASE 1: Cupons no Checkout** (15 min)
1. Adicionar handlers no CheckoutPage
2. Renderizar CouponInput
3. Exibir desconto aplicado no resumo

### **FASE 2: Criar Pedido** (10 min)
1. Verificar rota de criação de pedidos
2. Corrigir se estiver usando Edge Function
3. Testar criação

### **FASE 3: Esqueceu Senha** (30 min)
1. Criar componente ForgotPassword (já existe?)
2. Integrar com Supabase Auth
3. Adicionar link no AuthModal

### **FASE 4: Admin - Anúncios** (45 min)
1. Corrigir AdsManager para usar REST API
2. Adicionar upload de múltiplas imagens para Supabase Storage
3. Permitir URL externa OU upload local
4. Testar criação e edição

### **FASE 5: Admin - Equipe** (20 min)
1. Corrigir TeamManager para usar REST API
2. Testar adição e remoção

### **FASE 6: Admin - Reviews** (20 min)
1. Verificar ReviewManagement
2. Corrigir se necessário

### **FASE 7: Sincronização de Usuários** (15 min)
1. Verificar o que é "sincronização"
2. Corrigir rota

---

## ⏱️ TEMPO TOTAL ESTIMADO: ~2h30min

---

## 🚀 VAMOS COMEÇAR!
