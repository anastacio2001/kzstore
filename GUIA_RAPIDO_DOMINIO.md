# 🎯 Guia Rápido: Domínio kzstore.ao no Vercel

## ✅ Problema Resolvido
Os links de compartilhamento agora apontam para o artigo específico:
- ❌ Antes: `https://kzstore.vercel.app/blog` (página geral)
- ✅ Agora: `https://kzstore.ao/blog/nome-do-artigo` (artigo específico)

---

## 🚀 3 Passos Simples para Configurar o Domínio

### **Passo 1: Adicione o domínio no Vercel**

1. Acesse: https://vercel.com/ladislau-segunda-anastacios-projects
2. Clique no projeto **KZSTORE Online Shop-2**
3. Vá em **Settings** (aba superior)
4. Clique em **Domains** (menu lateral)
5. Digite: `kzstore.ao`
6. Clique em **Add**

O Vercel vai mostrar os registros DNS que você precisa configurar.

### **Passo 2: Configure DNS no seu provedor**

Onde você comprou o domínio kzstore.ao? (Angola Cables, NameCheap, etc.)

**Configure estes 2 registros:**

```
Registro 1 (Domínio principal):
Tipo: A
Nome: @ (ou deixe em branco)
Valor: 76.76.21.21
```

```
Registro 2 (WWW):
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

### **Passo 3: Aguarde e verifique**

- ⏱️ Aguarde 10 minutos a 48 horas (normalmente 1-2 horas)
- Verifique em: https://dnschecker.org/#A/kzstore.ao
- Quando aparecer ✅ verde no Vercel, está pronto!

---

## 🎨 URLs Após Configuração

### Frontend (Vercel):
- Principal: `https://kzstore.ao`
- WWW: `https://www.kzstore.ao` (redirecionará para kzstore.ao)

### Backend (Fly.io):
- API: `https://kzstore-backend.fly.dev`
- (Opcional) Você pode configurar: `https://api.kzstore.ao`

---

## 🛠️ Comando Rápido (Alternativa)

Se preferir fazer via terminal:

```bash
# Executar o script automatizado
./setup-domain.sh

# Ou manualmente:
vercel domains add kzstore.ao
```

---

## ❓ Perguntas Frequentes

### **1. Onde está meu domínio kzstore.ao?**
- Se você já comprou: Acesse o painel do provedor (Angola Cables, etc.)
- Se não comprou ainda: Precisa registrar primeiro

### **2. Quanto tempo demora?**
- Configuração no Vercel: 2 minutos
- Propagação DNS: 1-48 horas (geralmente 1-2 horas)

### **3. O que acontece com o URL antigo?**
- O Vercel continua funcionando: kzstore-xxx.vercel.app
- Mas o domínio principal será: kzstore.ao

### **4. Preciso pagar algo ao Vercel?**
- Não! Domínio personalizado é grátis no Vercel
- SSL/HTTPS é automático e grátis

### **5. E o backend no Fly.io?**
- Continua no mesmo URL: kzstore-backend.fly.dev
- Ou configure api.kzstore.ao (opcional)

---

## 📱 Teste Após Configuração

1. Acesse `https://kzstore.ao`
2. Vá no blog e abra um artigo
3. Clique em **Compartilhar**
4. O link deve ser: `https://kzstore.ao/blog/titulo-do-artigo`

---

## 🆘 Precisa de Ajuda?

**Erro comum: "Domain not found"**
- Verifique se os registros DNS estão corretos
- Aguarde mais tempo (DNS pode demorar)

**Erro: "SSL certificate pending"**
- Aguarde 5-10 minutos
- Vercel gera o certificado automaticamente

**Verificar DNS:**
```bash
dig kzstore.ao
nslookup kzstore.ao
```

---

## ✨ Deploy Atual

- **URL Atual**: https://kzstore-f3sc4onjs-ladislau-segunda-anastacios-projects.vercel.app
- **Após domínio**: https://kzstore.ao
- **Backend**: https://kzstore-backend.fly.dev ✅

---

**Status**: 
- ✅ Aplicação pronta
- ✅ Links de blog corretos
- 🔄 Aguardando configuração do domínio kzstore.ao

**Próximos passos**:
1. Configure DNS (registros A e CNAME)
2. Aguarde propagação
3. Teste em https://kzstore.ao
