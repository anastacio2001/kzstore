# 🧪 GUIA DE TESTE - CADASTRO DE CONTA

## 🔧 CORREÇÕES FEITAS:

✅ Melhor tratamento de erros
✅ Console.log detalhado para debug
✅ Modal fecha automaticamente após sucesso
✅ Mensagens de erro mais claras
✅ Loading state visível

---

## 📋 COMO TESTAR AGORA:

### **1. Abrir Console do Navegador (IMPORTANTE!)**

```
Pressionar F12 (ou Ctrl + Shift + I)
Clicar na aba "Console"
```

**Deixar aberto durante o teste para ver os logs!**

---

### **2. Fazer Cadastro**

```
1. Clicar em "Entrar" no header
2. Clicar em "Criar conta"
3. Preencher:
   Nome: Patrick Carlos
   Telefone: 953786098
   Email: patrick.test@kzstore.ao
   Senha: Patrick123!
   Confirmar: Patrick123!
4. Clicar em "Criar Conta"
```

---

### **3. Observar Console**

Você deve ver logs assim:

**✅ Se funcionar:**
```
📝 Creating account... {email: "patrick.test@kzstore.ao", nome: "Patrick Carlos", telefone: "953786098"}
🔵 [useAuth] Starting signup... {email: "patrick.test@kzstore.ao", nome: "Patrick Carlos", telefone: "953786098"}
🔵 [useAuth] Signup response: {data: {...}, error: null}
✅ [useAuth] Signup successful! patrick.test@kzstore.ao
✅ Login successful
✅ Success: Conta criada com sucesso!
```

**❌ Se der erro:**
```
❌ [useAuth] Signup error: {message: "User already registered"}
❌ Auth error: Error: User already registered
```

---

## 🔍 ERROS COMUNS E SOLUÇÕES:

### Erro 1: "User already registered"

**Causa:** Email já cadastrado no Supabase

**Solução:**
```
Opção A: Usar outro email
   - patrick.carlos.2@kzstore.ao
   - test123@kzstore.ao

Opção B: Deletar usuário existente
   1. Supabase Dashboard
   2. Authentication → Users
   3. Encontrar lauboy10@gmail.com
   4. Clicar no menu (•••) → Delete user
   5. Confirmar
   6. Tentar cadastro novamente
```

---

### Erro 2: "Invalid email or password"

**Causa:** Email ou senha não atendem requisitos

**Solução:**
```
Email: Deve ter @ e domínio válido
Senha: Mínimo 6 caracteres (recomendado 8+)

Exemplo válido:
Email: patrick@kzstore.ao
Senha: Patrick123!
```

---

### Erro 3: "Network error"

**Causa:** Problema de conexão com Supabase

**Solução:**
```
1. Verificar internet
2. Verificar se Supabase está online
3. Tentar novamente
```

---

### Erro 4: Modal não fecha

**Causa:** Erro silencioso não capturado

**Solução:**
```
1. Ver console (F12)
2. Copiar mensagem de erro exata
3. Me enviar para análise
```

---

## ✅ COMPORTAMENTO ESPERADO:

### Quando funciona:

```
1. Clicar "Criar Conta"
2. Botão mostra loading (spinner)
3. Console mostra logs de sucesso
4. Mensagem "Conta criada com sucesso!"
5. Modal fecha automaticamente (1 segundo)
6. Header mostra seu nome + avatar
7. Botão "Sair" aparece
```

---

## 🧪 TESTE ALTERNATIVO (Se não funcionar):

### Testar com conta demo:

```
1. Clicar "Entrar"
2. Já estar em modo "Entrar" (não "Criar Conta")
3. Preencher:
   Email: admin@kzstore.ao
   Senha: kzstore2024
4. Clicar "Entrar"
```

**Isso deve funcionar sempre (conta demo hardcoded)**

---

## 📸 O QUE VER NO CONSOLE:

### Logs importantes:

```javascript
// Início do cadastro
📝 Creating account...

// Chamada ao Supabase
🔵 [useAuth] Starting signup...

// Resposta do Supabase
🔵 [useAuth] Signup response:

// Sucesso
✅ [useAuth] Signup successful!
✅ Success: Conta criada com sucesso!

// OU Erro
❌ [useAuth] Signup error:
❌ Auth error:
```

---

## 🔄 SE PRECISAR RESETAR:

### Limpar tudo e começar do zero:

```
1. Fechar modal (X)
2. Pressionar Ctrl + Shift + Del
3. Marcar "Cookies" e "Cache"
4. Limpar
5. Recarregar página (F5)
6. Tentar novamente
```

---

## 📞 REPORTAR PROBLEMA:

Se ainda não funcionar, me envie:

```
1. Screenshot do console (F12)
2. Qual erro apareceu
3. Email que tentou usar
4. Se já tinha cadastrado antes com esse email
```

---

## 🎯 PRÓXIMOS PASSOS:

Após cadastro funcionar:

```
✅ Testar login Google (15 min propagação)
✅ Testar login Facebook
✅ Configurar Twilio
✅ Testar notificações
```

---

**AGORA TENTE NOVAMENTE E ME DIGA O QUE VÊ NO CONSOLE!** 🔍

*Guia criado para debug do cadastro KZSTORE*
