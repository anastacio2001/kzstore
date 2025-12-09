# 🚀 KZSTORE - Deploy no Fly.io

## ✅ Configuração Completa

### URLs do Projeto
- **App Fly.io**: https://kzstore-backend.fly.dev
- **Dashboard**: https://fly.io/apps/kzstore-backend

---

## 📋 Comandos Essenciais

### 🔍 **Monitoramento**
```bash
# Ver logs em tempo real
flyctl logs -a kzstore-backend

# Ver status da aplicação
flyctl status -a kzstore-backend

# Ver lista de apps
flyctl apps list
```

### 🚀 **Deploy**
```bash
# Deploy manual
flyctl deploy -a kzstore-backend

# Deploy com alta disponibilidade desativada (1 máquina = mais barato)
flyctl deploy --ha=false -a kzstore-backend

# Deploy direto do GitHub (automático após configurar)
# O Fly.io detecta pushes automaticamente se você configurar
```

### 🔐 **Gerenciar Secrets (Variáveis de Ambiente)**
```bash
# Listar secrets
flyctl secrets list -a kzstore-backend

# Adicionar/Atualizar secret
flyctl secrets set NOVA_VAR="valor" -a kzstore-backend

# Remover secret
flyctl secrets unset NOME_VAR -a kzstore-backend

# Importar de arquivo .env (cuidado!)
flyctl secrets import -a kzstore-backend < .env
```

### 💻 **SSH & Debug**
```bash
# Entrar no servidor via SSH
flyctl ssh console -a kzstore-backend

# Executar comando único
flyctl ssh console -a kzstore-backend -C "node --version"

# Ver uso de recursos
flyctl scale show -a kzstore-backend
```

### 📊 **Scaling (Ajustar Recursos)**
```bash
# Ver configuração atual
flyctl scale show -a kzstore-backend

# Aumentar memória RAM
flyctl scale memory 1024 -a kzstore-backend

# Ajustar número de CPUs
flyctl scale count 1 -a kzstore-backend

# Escalar para múltiplas regiões (HA)
flyctl regions add mad lhr -a kzstore-backend
```

### 🗄️ **Banco de Dados**
```bash
# Se usar PostgreSQL do Fly.io
flyctl postgres create --name kzstore-db
flyctl postgres attach kzstore-db -a kzstore-backend

# Conectar ao banco
flyctl postgres connect -a kzstore-db
```

### 🔄 **Reiniciar & Parar**
```bash
# Reiniciar aplicação
flyctl apps restart kzstore-backend

# Parar aplicação (economizar quando não usar)
flyctl scale count 0 -a kzstore-backend

# Reativar
flyctl scale count 1 -a kzstore-backend
```

---

## 💰 Custos Estimados

Com a configuração atual:
- **RAM**: 512MB
- **CPU**: 1 shared vCPU
- **Máquinas**: 1 (sem HA)

**Custo mensal**: ~$5-7 USD

### Dicas para Economizar:
1. Use `auto_stop_machines = true` no `fly.toml` (já configurado)
2. Mantenha apenas 1 máquina (`--ha=false`)
3. Use PostgreSQL Neon (externo) ao invés do Fly Postgres

---

## 🔧 Troubleshooting

### Ver logs de erro
```bash
flyctl logs -a kzstore-backend --tail 100
```

### App não inicia?
```bash
# Verificar health checks
flyctl checks list -a kzstore-backend

# Ver configuração
flyctl config show -a kzstore-backend
```

### Build falhou?
```bash
# Ver logs do build
flyctl logs -a kzstore-backend

# Rebuild forçado
flyctl deploy --force-rebuild -a kzstore-backend
```

---

## 🌍 Configurar Domínio Customizado

```bash
# Adicionar certificado SSL
flyctl certs create kzstore.ao -a kzstore-backend

# Ver status do certificado
flyctl certs show kzstore.ao -a kzstore-backend

# Configurar DNS (no seu provedor):
# Tipo: CNAME
# Nome: @
# Valor: kzstore-backend.fly.dev
```

---

## 📱 Monitoramento via Dashboard

Acesse: https://fly.io/apps/kzstore-backend/monitoring

Você pode ver:
- Métricas de CPU/RAM
- Requests por segundo
- Logs em tempo real
- Health checks

---

## 🚨 Alertas

Configure alertas por email em:
https://fly.io/apps/kzstore-backend/monitoring

---

## 📚 Documentação Oficial

- Fly.io Docs: https://fly.io/docs
- Fly.io CLI Reference: https://fly.io/docs/flyctl
- Pricing: https://fly.io/docs/about/pricing
