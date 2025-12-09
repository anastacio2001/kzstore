# 🌐 Configurar Domínio kzstore.ao no Vercel

## ✅ O que foi corrigido
- **Links de compartilhamento agora apontam para o artigo específico** em vez da página geral do blog
- Formato: `https://kzstore.ao/blog/{slug-do-artigo}`

---

## 📋 Passo a Passo: Adicionar Domínio Personalizado

### 1️⃣ Acesse o Dashboard do Vercel
1. Vá para: https://vercel.com/dashboard
2. Clique no projeto **KZSTORE Online Shop-2**
3. Vá na aba **Settings** → **Domains**

### 2️⃣ Adicione o Domínio
1. Digite: `kzstore.ao`
2. Clique em **Add**
3. Vercel vai mostrar os registros DNS necessários

### 3️⃣ Configuração DNS (no seu provedor de domínio)

O Vercel vai pedir para adicionar estes registros DNS:

#### **Opção A: Usar CNAME (Recomendado)**
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

```
Tipo: A
Nome: @
Valor: 76.76.21.21
```

#### **Opção B: Usar Nameservers Vercel (Mais fácil)**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### 4️⃣ Configure no seu Registrador de Domínio

**Se você tem o domínio em Angola Cables ou outro provedor:**

1. Faça login no painel do registrador
2. Vá em **Gestão DNS** ou **DNS Management**
3. Adicione os registros acima
4. Aguarde propagação DNS (pode levar até 48h, mas geralmente 1-2 horas)

### 5️⃣ Verificação no Vercel

Após adicionar os registros DNS:

1. Volte ao Vercel → Settings → Domains
2. Clique em **Refresh** ao lado do domínio
3. Quando verificado, aparecerá ✅ verde

### 6️⃣ Configurar Redirecionamento

No Vercel, configure:
- `www.kzstore.ao` → redirecionar para → `kzstore.ao`
- Isso garante que ambos funcionem

---

## 🔐 SSL/HTTPS Automático

O Vercel gera automaticamente certificado SSL gratuito via Let's Encrypt assim que o domínio for verificado.

---

## ⚙️ Configuração Atual

### URLs de Produção:
- **Vercel (frontend)**: https://kzstore-f3sc4onjs-ladislau-segunda-anastacios-projects.vercel.app
- **Fly.io (backend)**: https://kzstore-backend.fly.dev
- **Futuro**: https://kzstore.ao (quando DNS configurado)

### Backend API:
Após configurar o domínio, você precisará atualizar:

**No arquivo `.env.production` (frontend):**
```bash
VITE_API_URL=https://kzstore-backend.fly.dev
```

Isso já está correto e não precisa mudar, pois o backend continua no Fly.io.

---

## 🧪 Testar Após Configuração

1. Acesse: `https://kzstore.ao`
2. Teste compartilhar um artigo do blog
3. Verifique se o link aponta para `https://kzstore.ao/blog/nome-do-artigo`

---

## 📞 Suporte

Se tiver problemas:

1. **DNS não propaga**: Aguarde 24-48h
2. **Erro SSL**: Vercel gera automaticamente, aguarde alguns minutos
3. **Domínio não verifica**: Verifique se os registros DNS estão corretos usando: https://dnschecker.org

---

## 🎯 Próximos Passos

Depois de configurar o domínio:

1. ✅ **Email profissional**: Configurar `contato@kzstore.ao`
2. ✅ **Google Analytics**: Adicionar tracking
3. ✅ **Facebook Pixel**: Para anúncios
4. ✅ **Sitemap**: Gerar para SEO (`/sitemap.xml`)

---

## 💡 Dica Extra: Domínio Personalizado no Backend

Se quiser usar `api.kzstore.ao` para o backend:

1. No Fly.io dashboard: https://fly.io/dashboard
2. Vá em **Certificates**
3. Adicione `api.kzstore.ao`
4. Configure CNAME no DNS:
   ```
   Tipo: CNAME
   Nome: api
   Valor: kzstore-backend.fly.dev
   ```

Depois atualize o `.env.production`:
```bash
VITE_API_URL=https://api.kzstore.ao
```

---

**Status Atual**: 
- ✅ Aplicação pronta para produção
- ✅ Links de compartilhamento corretos
- 🔄 Aguardando configuração DNS do domínio kzstore.ao
