# 💰 Comparação de Custos - Hosting KZSTORE

## 📊 Comparação Rápida

| Serviço | Plano Gratuito | Plano Pago | Melhor Para |
|---------|----------------|------------|-------------|
| **Vercel** | ✅ Generoso | $20/mês | Deploy rápido, CI/CD |
| **Netlify** | ✅ Generoso | $19/mês | Simplicidade |
| **Google Cloud (Firebase Hosting)** | ✅ Limitado | Pay-as-you-go | Controle total |
| **Google Cloud (App Engine)** | ❌ Não | ~$25/mês | Apps complexas |
| **Supabase** | ✅ 500MB DB | $25/mês | Já está usando! |

---

## 1️⃣ VERCEL (RECOMENDADO)

### Plano Hobby (Gratuito):
- ✅ **Banda:** 100GB/mês
- ✅ **Builds:** Ilimitados
- ✅ **Domínios:** Ilimitados (custom domain grátis)
- ✅ **SSL:** Automático e gratuito
- ✅ **Deploy:** Automático do GitHub
- ✅ **Serverless Functions:** 100GB-Hrs
- ❌ **Limite:** 1 projeto comercial

**Custo para você:** 🆓 **GRATUITO**

### Plano Pro ($20/mês):
- ✅ Tudo do gratuito +
- ✅ Analytics avançado
- ✅ Mais builds simultâneos
- ✅ Suporte prioritário
- ✅ Projetos comerciais ilimitados

**Quando precisar:** Quando tiver +100.000 visitas/mês

---

## 2️⃣ NETLIFY

### Plano Starter (Gratuito):
- ✅ **Banda:** 100GB/mês
- ✅ **Builds:** 300 minutos/mês
- ✅ **Domínios:** Custom domain grátis
- ✅ **SSL:** Automático
- ✅ **Deploy:** Drag & Drop ou GitHub
- ✅ **Forms:** 100 submissions/mês

**Custo para você:** 🆓 **GRATUITO**

### Plano Pro ($19/mês):
- ✅ Banda: 400GB/mês
- ✅ Builds: 1000 minutos/mês
- ✅ Analytics
- ✅ Suporte prioritário

**Quando precisar:** Quando tiver +50.000 visitas/mês

---

## 3️⃣ GOOGLE CLOUD CONSOLE

### Opção A: Firebase Hosting

#### Plano Spark (Gratuito):
- ✅ **Banda:** 10GB/mês (⚠️ MENOS que Vercel)
- ✅ **Storage:** 1GB
- ✅ **SSL:** Automático
- ✅ **Custom Domain:** Grátis
- ❌ **Limite:** Só sites estáticos básicos

**Custo estimado para você:** 🆓 **GRATUITO** (mas limitado)

#### Plano Blaze (Pay-as-you-go):
- 💰 **Storage:** $0.026/GB
- 💰 **Banda:** $0.15/GB (após 10GB)
- 💰 **Estimativa:** ~$5-15/mês para 50GB tráfego

**Como configurar:**
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar
firebase init hosting

# Deploy
firebase deploy
```

### Opção B: Google Cloud Run

#### Custos:
- 💰 **vCPU:** $0.00002400/vCPU-second
- 💰 **Memória:** $0.00000250/GiB-second
- 💰 **Requests:** $0.40/milhão
- 💰 **Estimativa:** ~$10-30/mês

**Complexidade:** ⚠️ Requer Docker + configuração avançada

### Opção C: App Engine

#### Custos:
- 💰 **Instância F1:** ~$0.05/hora = ~$36/mês
- 💰 **Instância B1:** ~$0.05/hora (só quando ativo)
- 💰 **Banda:** $0.12/GB (após 1GB gratuito)

**Complexidade:** ⚠️ Requer configuração app.yaml

---

## 4️⃣ SUPABASE (Que você já usa!)

### Plano Free:
- ✅ **Database:** 500MB
- ✅ **Storage:** 1GB
- ✅ **Banda DB:** Ilimitada
- ✅ **Auth:** Ilimitado
- ❌ **Pausa após 7 dias inativo**

**Status atual:** ✅ Você está usando este

### Plano Pro ($25/mês):
- ✅ Database: 8GB
- ✅ Storage: 100GB
- ✅ Sem pausa automática
- ✅ Backups diários

**Quando precisar:** Quando passar de 500MB no banco

---

## 💡 RECOMENDAÇÃO PARA KZSTORE

### 🏆 Setup Ideal (100% GRATUITO):

1. **Frontend:** Vercel (Gratuito)
   - Deploy automático
   - SSL grátis
   - 100GB banda/mês
   - Custom domain grátis

2. **Backend/DB:** Supabase Free
   - 500MB database
   - 1GB storage
   - Auth incluído

3. **Imagens:** Supabase Storage (1GB)
   - Ou usar Cloudinary (10GB grátis)

**Custo Total:** 🆓 **$0/mês**

**Suporta até:** ~10.000-50.000 visitas/mês

---

## 📈 Quando Escalar

### Cenário 1: 50.000 visitas/mês
- **Vercel:** Ainda gratuito ✅
- **Supabase:** Ainda gratuito ✅
- **Custo:** $0/mês

### Cenário 2: 100.000 visitas/mês
- **Vercel Pro:** $20/mês
- **Supabase Free:** Ainda ok ✅
- **Custo:** $20/mês

### Cenário 3: 500.000 visitas/mês
- **Vercel Pro:** $20/mês
- **Supabase Pro:** $25/mês
- **CDN (Cloudflare):** Gratuito
- **Custo:** $45/mês

---

## 🎯 COMPARAÇÃO: Vercel vs Google Cloud

| Aspecto | Vercel | Google Cloud (Firebase) |
|---------|--------|------------------------|
| **Setup** | 5 minutos | 15-30 minutos |
| **Complexidade** | ⭐ Muito fácil | ⭐⭐⭐ Médio |
| **Banda gratuita** | 100GB/mês | 10GB/mês |
| **Deploy automático** | ✅ Sim | ⚠️ Requer config |
| **SSL** | ✅ Automático | ✅ Automático |
| **Custom Domain** | ✅ Grátis | ✅ Grátis |
| **CI/CD** | ✅ Built-in | ❌ Manual |
| **Preview deploys** | ✅ Sim | ❌ Não |
| **Rollback** | ✅ 1 clique | ⚠️ Manual |
| **Suporte** | 📧 Email | 📧 Fórum |

**Vencedor:** 🏆 **VERCEL** (para seu caso)

---

## 🚀 TUTORIAL: Deploy no Google Cloud (Firebase)

Se ainda quiser testar Firebase:

### Passo 1: Criar Projeto
```powershell
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar projeto
firebase init hosting
```

### Passo 2: Configurar firebase.json
```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Passo 3: Deploy
```powershell
# Build
npm run build

# Deploy
firebase deploy --only hosting
```

### Custos Estimados:
- **0-10GB banda:** Grátis
- **10-50GB banda:** ~$6/mês
- **50-100GB banda:** ~$13.50/mês

---

## 💰 RESUMO DE CUSTOS MENSAL

### Fase Inicial (0-50k visitas):
| Serviço | Custo |
|---------|-------|
| Vercel Free | $0 |
| Supabase Free | $0 |
| **TOTAL** | **$0/mês** |

### Crescimento (50k-200k visitas):
| Serviço | Custo |
|---------|-------|
| Vercel Pro | $20 |
| Supabase Free | $0 |
| **TOTAL** | **$20/mês** |

### Estabelecido (200k+ visitas):
| Serviço | Custo |
|---------|-------|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| Cloudflare (CDN) | $0 |
| **TOTAL** | **$45/mês** |

---

## 🎁 EXTRAS GRATUITOS

### Cloudinary (Imagens):
- ✅ 25GB storage gratuito
- ✅ 25GB banda/mês
- ✅ Transformações de imagem

### Cloudflare (CDN + DNS):
- ✅ CDN global gratuito
- ✅ SSL gratuito
- ✅ DDoS protection
- ✅ Analytics básico

### Resend (Emails):
- ✅ 100 emails/dia grátis
- ✅ 3.000 emails/mês

---

## ✅ RESPOSTA FINAL

### Para KZSTORE, recomendo:

1. **COMEÇAR COM VERCEL (GRÁTIS)**
   - ✅ Mais fácil
   - ✅ Mais rápido
   - ✅ Mais banda (100GB vs 10GB)
   - ✅ CI/CD automático
   - ✅ Preview deploys
   - ✅ Rollback fácil

2. **Google Cloud** só vale a pena se:
   - ❌ Você precisar de features específicas do GCP
   - ❌ Quiser integrar com outros serviços Google
   - ❌ Já tem créditos do Google Cloud

### Custo Total Estimado:
- **Mês 1-6:** $0/mês (Vercel + Supabase Free)
- **Mês 7+:** $0-20/mês (depende do tráfego)

**Quando começar a pagar no Vercel?**
- Quando ultrapassar 100GB banda/mês
- Ou quando quiser analytics avançado
- Ou quando precisar de suporte prioritário

---

## 🆘 TL;DR

**Pergunta:** Qual é mais barato?
**Resposta:** Vercel e Netlify são 100% GRATUITOS até 100GB/mês

**Pergunta:** Google Cloud é mais barato?
**Resposta:** NÃO. Firebase só tem 10GB grátis (10x menos)

**Pergunta:** Qual devo usar?
**Resposta:** **VERCEL** - Grátis, fácil, rápido, 100GB banda

**Custo atual:** $0/mês
**Custo futuro:** $0-45/mês (depende do crescimento)

---

**Última atualização:** 12 de Novembro de 2025
**Recomendação:** 🏆 Vercel Free + Supabase Free = $0/mês
