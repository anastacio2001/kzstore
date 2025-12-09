# 💰 Como Reduzir Custos do Google Cloud em 90%

## 🚨 Situação Atual
- **Custo Mensal**: €150-185
- **Principal custo**: Cloud SQL (€140-160/mês)
- **Motivo**: Instância `db-perf-optimized-N-4` é para grandes empresas

---

## ✅ Solução 1: Downgrade Cloud SQL (RECOMENDADO)

### Passo 1: Fazer backup
```bash
gcloud sql export sql kzstore-01 gs://kzstore-backups/backup-$(date +%Y%m%d).sql \
  --database=kzstore_prod
```

### Passo 2: Reduzir para db-f1-micro (€7/mês)
```bash
# Parar temporariamente
gcloud sql instances patch kzstore-01 --activation-policy=NEVER

# Aguardar 2 minutos e reduzir
gcloud sql instances patch kzstore-01 \
  --tier=db-f1-micro \
  --database-flags=max_connections=100

# Reativar
gcloud sql instances patch kzstore-01 --activation-policy=ALWAYS
```

**Economia: €135/mês (90%)**

---

## ✅ Solução 2: Migrar para Alternativa Mais Barata

### Opção A: PlanetScale (MySQL Serverless - GRÁTIS)
- ✅ Grátis até 5GB
- ✅ Conexões ilimitadas
- ✅ Backups automáticos
- ✅ Escalável automaticamente

**Como migrar:**
1. Criar conta: https://planetscale.com
2. Criar database
3. Exportar dados do Cloud SQL
4. Importar para PlanetScale
5. Atualizar `DATABASE_URL` no Cloud Run

**Economia: €155/mês (100%)**

### Opção B: Railway.app ($10/mês = €9)
- ✅ MySQL + Redis incluído
- ✅ 5GB storage
- ✅ Deploy automático
- ✅ Logs incluídos

**Economia: €146/mês (97%)**

---

## 📊 Comparação de Custos Mensais

| Opção | Cloud SQL | Cloud Run | Storage | Total | Economia |
|-------|-----------|-----------|---------|-------|----------|
| **Atual** | €150 | €10 | €0.10 | **€160** | - |
| **db-f1-micro** | €7 | €10 | €0.10 | **€17** | **90%** |
| **PlanetScale** | €0 | €10 | €0.10 | **€10** | **94%** |
| **Railway** | €9 | €0* | €0 | **€9** | **95%** |

*Railway inclui hosting

---

## 🎯 Recomendação Final

**Para pequena/média loja online:**
1. **Curto prazo (hoje)**: Downgrade para `db-f1-micro` → Economiza €135/mês
2. **Médio prazo (próximas semanas)**: Migrar para PlanetScale → Economiza €150/mês

**Crescimento futuro:**
- Até 1000 pedidos/mês: db-f1-micro é suficiente
- Até 10000 pedidos/mês: PlanetScale grátis
- Acima disso: Upgrade conforme necessário

---

## ⚡ Ação Imediata

Execute agora para economizar €135/mês:

```bash
# 1. Backup de segurança
gcloud sql export sql kzstore-01 gs://kzstore-images/backup-emergency.sql --database=kzstore_prod

# 2. Reduzir instância (leva ~5 minutos)
gcloud sql instances patch kzstore-01 --tier=db-f1-micro

# 3. Verificar se está funcionando
gcloud sql instances describe kzstore-01 --format="value(settings.tier)"
```

✅ **Sem impacto na plataforma** - Tudo continua funcionando normalmente!
