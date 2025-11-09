# ⚡ CONFIGURAR AGORA - KZSTORE
## Guia Rápido de 30 Minutos para Produção

---

## 🎯 O QUE FALTA (APENAS 3 COISAS!)

```
┌─────────────────────────────────────────────────────┐
│  STATUS ATUAL: 95% COMPLETO ✅                      │
│                                                     │
│  ✅ 33 Produtos cadastrados                        │
│  ✅ Sistema completo funcionando                   │
│  ✅ WhatsApp configurado (+244931054015)           │
│  ✅ Sistema de publicidade implementado            │
│  ✅ Gestão de equipe implementada                  │
│                                                     │
│  FALTA APENAS:                                      │
│  ⚠️  1. GEMINI_API_KEY (chatbot IA)               │
│  ⚠️  2. Informações da empresa (NIF, contas)      │
│  ⚠️  3. Senha admin (segurança)                   │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 CONFIGURAÇÃO RÁPIDA (30 MINUTOS)

### 1️⃣ GEMINI_API_KEY (5 minutos)

**O que é:** Permite chatbot inteligente com IA

**Passos:**
```bash
1. Abra: https://makersuite.google.com/app/apikey
2. Faça login com Google
3. Clique em "Create API Key"
4. Copie a chave (exemplo: AIzaSyB...)
```

**Configure:**
```bash
1. Acesse Supabase Dashboard
2. Settings → Edge Functions → Secrets
3. Adicione:
   Nome: GEMINI_API_KEY
   Valor: [cole sua chave]
4. Save
```

**✅ Feito!** O chatbot agora responde com IA

---

### 2️⃣ INFORMAÇÕES DA EMPRESA (10 minutos)

**Arquivo:** `/config/constants.ts`

**O que precisa:**

#### a) Endereço Completo
```typescript
// LINHA 12
address: 'Rua XYZ, Nº 123, Bairro ABC, Luanda, Angola',
```

#### b) NIF da Empresa
```typescript
// LINHA 13
nif: '1234567890',  // Seu NIF real
```

#### c) Conta BAI
```typescript
// LINHAS 67-68
bai: {
  name: 'Banco Angolano de Investimentos (BAI)',
  account: '1234.5678.9012.3456.7',  // Sua conta
  iban: 'AO06.1234.5678.9012.3456.7890.1'  // Seu IBAN
},
```

#### d) Conta BFA (se tiver)
```typescript
// LINHAS 71-74
bfa: {
  name: 'Banco de Fomento Angola (BFA)',
  account: '1234.5678.9012.3456.7',  // Sua conta
  iban: 'AO06.1234.5678.9012.3456.7890.1'  // Seu IBAN
},
```

**✅ Feito!** Clientes verão suas informações corretas

---

### 3️⃣ SENHA ADMIN (5 minutos) 🔴 CRÍTICO

**⚠️ ATENÇÃO:** Senha atual é pública e INSEGURA!

**Senha atual:**
```
Email: admin@kzstore.ao
Senha: kzstore2024  ← TODOS SABEM ESTA SENHA!
```

**MUDAR AGORA:**

#### Opção A - Criar usuário no Supabase (RECOMENDADO):
```bash
1. Supabase Dashboard → Authentication → Users
2. "Add user" → "Create new user"
3. Preencha:
   - Email: admin@kzstore.ao
   - Password: [SENHA FORTE E ÚNICA]
   - ✅ Email Confirm (marcar)
4. Save
```

Depois, remova do código:
```typescript
// Arquivo: /hooks/useAuth.tsx (linha 59)
// REMOVA ou COMENTE:
if (email === 'admin@kzstore.ao' && password === 'kzstore2024') {
  // ... todo este bloco
}
```

#### Opção B - Mudar no código (temporário):
```typescript
// Arquivo: /hooks/useAuth.tsx (linha 59)
if (email === 'admin@kzstore.ao' && password === 'MinhaS3nh@Forte123!') {
  // ...
}
```

**✅ Feito!** Seu admin está seguro

---

## 📋 CHECKLIST RÁPIDO

Marque conforme completa:

```
┌─────────────────────────────────────────┐
│ CONFIGURAÇÕES OBRIGATÓRIAS              │
├─────────────────────────────────────────┤
│ [ ] GEMINI_API_KEY adicionado           │
│ [ ] Endereço completo atualizado        │
│ [ ] NIF da empresa adicionado           │
│ [ ] Conta BAI configurada               │
│ [ ] Conta BFA configurada (se tiver)    │
│ [ ] Senha admin alterada                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ TESTES RÁPIDOS (10 min)                 │
├─────────────────────────────────────────┤
│ [ ] Fazer uma compra teste              │
│ [ ] Verificar info bancária no checkout │
│ [ ] Testar chatbot                      │
│ [ ] Login no admin                      │
│ [ ] Criar anúncio teste                 │
│ [ ] Ver anúncio na loja                 │
│ [ ] Abrir WhatsApp (+244931054015)      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ DADOS DE EXEMPLO (5 min) - OPCIONAL    │
├─────────────────────────────────────────┤
│ [ ] Acesse /admin                       │
│ [ ] Dashboard → "Dados de Exemplo"      │
│ [ ] Clique "Criar Dados de Exemplo"     │
│ [ ] Aguarde criação (6 anúncios + 5 equipe) │
│ [ ] Veja anúncios na loja               │
└─────────────────────────────────────────┘
```

---

## 🎯 ONDE CADA COISA ESTÁ

```
/config/constants.ts
├── LINHA 12: address (endereço)
├── LINHA 13: nif (NIF empresa)
├── LINHA 67-68: Conta BAI
└── LINHA 71-74: Conta BFA

/hooks/useAuth.tsx
└── LINHA 59: Senha admin

Supabase Dashboard
└── Settings → Edge Functions → Secrets
    └── GEMINI_API_KEY
```

---

## 🆘 PROBLEMAS COMUNS

### "Não consigo editar arquivos"
**Solução:** Use o editor de código (VS Code, etc)

### "Não encontro o Supabase Dashboard"
**Solução:** https://supabase.com/dashboard → Seu projeto

### "GEMINI_API_KEY não funciona"
**Solução:** 
1. Verifique se copiou a chave completa
2. Confirme que salvou no Supabase
3. Reinicie o Edge Function

### "Esqueci minha senha admin"
**Solução:** 
1. Acesse Supabase → Authentication → Users
2. Encontre seu usuário admin
3. Clique nos 3 pontos → "Reset Password"

---

## ✅ TUDO PRONTO?

Quando todos os checkboxes estiverem marcados:

```
🎉 PARABÉNS! 🎉

Sua KZSTORE está 100% pronta para vendas!

Próximos passos:
1. Compartilhe o link da loja
2. Divulgue nas redes sociais
3. Configure anúncios (já tem sistema!)
4. Adicione mais membros da equipe
5. Monitore suas vendas no admin

BOA SORTE! 💰🚀
```

---

## 🔗 LINKS ÚTEIS

```
📍 Sua Loja: [URL do Supabase]
👨‍💼 Admin Panel: [URL]/admin
📊 Supabase Dashboard: https://supabase.com/dashboard
🤖 Google AI Studio: https://makersuite.google.com
📱 WhatsApp: https://wa.me/244931054015
```

---

## 📞 CONTATO

**Dúvidas?**
- 📖 Veja: `/CHECKLIST_PRODUCAO.md` (guia completo)
- 📖 Veja: `/ADS_AND_TEAM_SYSTEM.md` (sistema de anúncios)
- 📖 Veja: `/PRODUCTION_READY.md` (documentação técnica)

---

## ⏱️ TEMPO ESTIMADO POR TAREFA

```
┌────────────────────────────────────┬──────────┐
│ Tarefa                             │ Tempo    │
├────────────────────────────────────┼──────────┤
│ 1. GEMINI_API_KEY                  │ 5 min    │
│ 2. Informações empresa             │ 10 min   │
│ 3. Senha admin                     │ 5 min    │
│ 4. Testes                          │ 10 min   │
├────────────────────────────────────┼──────────┤
│ TOTAL                              │ 30 min   │
└────────────────────────────────────┴──────────┘

OPCIONAL:
├── Criar dados de exemplo           │ 5 min    │
├── Google Analytics                 │ 10 min   │
└── Redes sociais                    │ 5 min    │
```

---

**COMECE AGORA! ⚡**

Cada minuto conta. Em apenas 30 minutos você estará vendendo online! 🚀

---

*Guia criado: Dezembro 2024*  
*Versão: 1.0 - Completo com Sistema de Publicidade*
