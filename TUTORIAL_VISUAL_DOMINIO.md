# 📸 Passo a Passo Visual: Configurar kzstore.ao no Vercel

## 🎯 O que vamos fazer
Configurar o domínio **kzstore.ao** para que seu site fique acessível em vez do URL do Vercel.

---

## 📋 Parte 1: Adicionar Domínio no Vercel

### **Passo 1.1: Acesse o Dashboard**
1. Abra: https://vercel.com/dashboard
2. Faça login se necessário
3. Você verá a lista de projetos

### **Passo 1.2: Selecione o Projeto**
- Procure: **KZSTORE Online Shop-2**
- Clique no nome do projeto

### **Passo 1.3: Vá para Settings → Domains**
```
[Aba superior]
Settings → [Menu lateral] Domains
```

### **Passo 1.4: Adicione o Domínio**
```
┌─────────────────────────────────────┐
│ Add Domain                          │
├─────────────────────────────────────┤
│ Enter domain name:                  │
│ ┌─────────────────────────────────┐ │
│ │ kzstore.ao                      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Add]                               │
└─────────────────────────────────────┘
```

### **Passo 1.5: Vercel Mostra os Registros DNS**
Após clicar em "Add", o Vercel vai mostrar algo assim:

```
┌─────────────────────────────────────────────┐
│ ⚠️ DNS Configuration Required               │
├─────────────────────────────────────────────┤
│ Add these records to your DNS provider:     │
│                                             │
│ 1. A Record                                 │
│    Type: A                                  │
│    Name: @                                  │
│    Value: 76.76.21.21                       │
│                                             │
│ 2. CNAME Record (optional, for www)         │
│    Type: CNAME                              │
│    Name: www                                │
│    Value: cname.vercel-dns.com              │
└─────────────────────────────────────────────┘
```

**📝 IMPORTANTE: Copie esses valores!**

---

## 🌐 Parte 2: Configurar DNS no Provedor do Domínio

### **Onde está seu domínio kzstore.ao?**

Se você comprou em **Angola Cables** ou outro provedor angolano:

1. Faça login no painel do provedor
2. Procure por: **DNS Management** ou **Gestão de DNS**
3. Encontre a zona DNS do domínio **kzstore.ao**

### **Adicionar Registros DNS**

#### **Registro 1: A Record (Domínio Principal)**
```
┌────────────────────────────────────────┐
│ Tipo:     A                            │
│ Nome:     @ (ou deixe em branco)       │
│ Valor:    76.76.21.21                  │
│ TTL:      3600 (ou Auto)               │
└────────────────────────────────────────┘
```

#### **Registro 2: CNAME (WWW)**
```
┌────────────────────────────────────────┐
│ Tipo:     CNAME                        │
│ Nome:     www                          │
│ Valor:    cname.vercel-dns.com         │
│ TTL:      3600 (ou Auto)               │
└────────────────────────────────────────┘
```

### **Exemplo Visual (Painel Genérico)**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 DNS RECORDS FOR: kzstore.ao
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────┬──────┬───────────────────────┬──────┬────────┐
│ Type │ Name │ Value                 │ TTL  │ Action │
├──────┼──────┼───────────────────────┼──────┼────────┤
│ A    │ @    │ 76.76.21.21           │ 3600 │ [Edit] │
│ CNAME│ www  │ cname.vercel-dns.com  │ 3600 │ [Edit] │
└──────┴──────┴───────────────────────┴──────┴────────┘

[+ Add Record]  [Save Changes]
```

### **Clique em "Save" ou "Update"**

---

## ⏱️ Parte 3: Aguardar Propagação DNS

### **Quanto tempo demora?**
- Mínimo: 10-30 minutos
- Máximo: 48 horas
- Média: 1-2 horas

### **Como verificar se propagou?**

#### **Método 1: DNSChecker Online**
1. Acesse: https://dnschecker.org
2. Digite: `kzstore.ao`
3. Selecione: `A`
4. Veja se aparece **76.76.21.21** em vários servidores

#### **Método 2: Terminal**
```bash
dig kzstore.ao

# Você deve ver:
# kzstore.ao.    3600    IN    A    76.76.21.21
```

#### **Método 3: NSLookup**
```bash
nslookup kzstore.ao

# Resultado esperado:
# Server:  8.8.8.8
# Address: 8.8.8.8#53
# 
# Name:    kzstore.ao
# Address: 76.76.21.21
```

---

## ✅ Parte 4: Verificação no Vercel

### **Volte ao Vercel**
1. Dashboard → Seu Projeto → Settings → Domains
2. Você verá o status do domínio:

```
┌─────────────────────────────────────────────┐
│ kzstore.ao                                  │
│ ⏳ Verifying...                             │
└─────────────────────────────────────────────┘
```

### **Após DNS propagar:**
```
┌─────────────────────────────────────────────┐
│ kzstore.ao                          ✅ Valid│
│ SSL: Active                                 │
│ Redirects: www → kzstore.ao                 │
└─────────────────────────────────────────────┘
```

### **Clique em "Refresh"**
Se ainda aparecer "Verifying", clique no botão refresh ao lado do domínio.

---

## 🔐 Parte 5: SSL/HTTPS (Automático)

O Vercel gera automaticamente um certificado SSL gratuito via Let's Encrypt.

**Status do SSL:**
```
┌─────────────────────────────────────────────┐
│ 🔒 SSL Certificate                          │
│ Status: Active                              │
│ Issuer: Let's Encrypt                       │
│ Valid Until: [data futura]                  │
└─────────────────────────────────────────────┘
```

**Isso significa:**
- ✅ `https://kzstore.ao` funcionará automaticamente
- ✅ Certificado renova automaticamente
- ✅ Sem custos adicionais

---

## 🎉 Parte 6: Teste Final

### **1. Acesse o site**
```
https://kzstore.ao
```

### **2. Teste o blog**
1. Vá para a seção Blog
2. Abra um artigo qualquer
3. Clique em "Compartilhar"

### **3. Verifique o link**
O link copiado deve ser:
```
https://kzstore.ao/blog/nome-do-artigo
```

**✅ NÃO deve ser:**
- ❌ `https://kzstore-xxx.vercel.app/blog`
- ❌ `https://kzstore.ao/blog` (sem o nome do artigo)

---

## 🛠️ Configurações Adicionais (Opcional)

### **Redirecionar WWW para Não-WWW**
No Vercel → Settings → Domains:
```
┌─────────────────────────────────────────────┐
│ www.kzstore.ao                              │
│ Redirect to: kzstore.ao              [Edit] │
└─────────────────────────────────────────────┘
```

### **Adicionar API Subdomain (api.kzstore.ao)**
Para deixar o backend mais profissional:

1. No **Fly.io Dashboard**: https://fly.io/dashboard/kzstore-backend
2. Vá em **Certificates**
3. Adicione: `api.kzstore.ao`
4. Configure no DNS:
```
Tipo: CNAME
Nome: api
Valor: kzstore-backend.fly.dev
```

---

## 📊 Resumo Visual

### **Antes:**
```
┌─────────────────────────────────────────────┐
│ URL: https://kzstore-f3sc4onjs...vercel.app │
│ Backend: https://kzstore-backend.fly.dev    │
└─────────────────────────────────────────────┘
```

### **Depois (com domínio configurado):**
```
┌─────────────────────────────────────────────┐
│ URL: https://kzstore.ao                ✅   │
│ Backend: https://kzstore-backend.fly.dev    │
│ (ou) https://api.kzstore.ao (opcional) ✨   │
└─────────────────────────────────────────────┘
```

---

## ❓ Troubleshooting

### **Problema: "Domain not found"**
**Solução:**
- Verifique se os registros DNS estão corretos
- Aguarde mais tempo (pode levar até 48h)
- Use DNSChecker para ver a propagação global

### **Problema: "SSL pending"**
**Solução:**
- Aguarde 5-10 minutos
- O Vercel gera automaticamente
- Se demorar mais de 1 hora, abra um ticket no Vercel

### **Problema: "Site não carrega"**
**Solução:**
1. Teste: `https://kzstore-xxx.vercel.app` (deve funcionar)
2. Se funciona → problema é DNS
3. Se não funciona → problema no build/deploy

### **Problema: "Links de compartilhamento errados"**
**Solução:**
- Já corrigido no último deploy ✅
- Links agora apontam para artigo específico
- Se ainda estiver errado, limpe o cache do navegador

---

## 📞 Suporte

**Vercel Support:**
- Dashboard: https://vercel.com/support
- Docs: https://vercel.com/docs/concepts/projects/custom-domains

**DNS Provider Support:**
- Angola Cables: (suporte do provedor)
- Ou seu registrador de domínio

---

## ✨ Checklist Final

```
☐ Domínio adicionado no Vercel
☐ Registro A configurado (@ → 76.76.21.21)
☐ Registro CNAME configurado (www → cname.vercel-dns.com)
☐ DNS propagou (verificado em dnschecker.org)
☐ Vercel mostra ✅ verde
☐ SSL ativo (https funciona)
☐ Site carrega em https://kzstore.ao
☐ Links de blog redirecionam para artigo específico
☐ WWW redireciona para domínio principal
```

**Quando todos os itens estiverem ✅, está pronto!** 🎉

---

**Deploy Atual**: https://kzstore-f3sc4onjs-ladislau-segunda-anastacios-projects.vercel.app  
**Após configuração**: https://kzstore.ao
