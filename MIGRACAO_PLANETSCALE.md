# 🚀 Migração para PlanetScale - KZSTORE

## 💰 Economia Final
- **Custo Atual**: €60-75/mês
- **Custo com PlanetScale**: €10-25/mês
- **Economia**: €50-65/mês (83% de redução)
- **Economia Anual**: €600-780 🎉

---

## 📋 Checklist de Migração

### Fase 1: Preparação (15 min)
- [ ] Criar conta PlanetScale
- [ ] Criar database
- [ ] Exportar dados do Cloud SQL
- [ ] Importar para PlanetScale

### Fase 2: Configuração (10 min)
- [ ] Obter connection string
- [ ] Atualizar variáveis de ambiente
- [ ] Testar conexão local

### Fase 3: Deploy (5 min)
- [ ] Atualizar Cloud Run
- [ ] Verificar site funcionando
- [ ] Desativar Cloud SQL

---

## 🎯 Passo 1: Criar Conta PlanetScale

1. Acesse: https://auth.planetscale.com/sign-up
2. Crie conta (pode usar Google/GitHub)
3. Escolha plano **Hobby** (Grátis)

**Limites do plano grátis:**
- ✅ 5 GB storage
- ✅ 1 bilhão de reads/mês
- ✅ 10 milhões de writes/mês
- ✅ Backups diários automáticos
- ✅ Conexões ilimitadas

---

## 🎯 Passo 2: Criar Database

No dashboard PlanetScale:

1. Clique em **"Create a database"**
2. Nome: `kzstore-prod`
3. Região: **AWS Frankfurt (eu-central-1)** (mais próximo de Angola)
4. Clique em **"Create database"**

---

## 🎯 Passo 3: Exportar Dados Atuais

Execute no terminal:

```bash
# 1. Exportar do Cloud SQL
gcloud sql export sql kzstore-01 \
  gs://kzstore-backups-202512/export-to-planetscale-$(date +%Y%m%d).sql \
  --database=kzstore_prod

# 2. Baixar para local
gsutil cp gs://kzstore-backups-202512/export-to-planetscale-*.sql ~/Desktop/
```

---

## 🎯 Passo 4: Obter Connection String do PlanetScale

No dashboard PlanetScale:

1. Clique no database `kzstore-prod`
2. Vá em **"Connect"**
3. Selecione **"Prisma"**
4. Copie o **DATABASE_URL**

Exemplo:
```
mysql://username:password@aws.connect.psdb.cloud/kzstore-prod?sslaccept=strict
```

---

## 🎯 Passo 5: Importar Dados para PlanetScale

### Opção A: Via PlanetScale CLI (Recomendado)

```bash
# 1. Instalar PlanetScale CLI
brew install planetscale/tap/pscale

# 2. Login
pscale auth login

# 3. Criar branch development
pscale branch create kzstore-prod development

# 4. Conectar ao database
pscale connect kzstore-prod development --port 3309

# 5. Em outro terminal, importar dados
mysql -h 127.0.0.1 -P 3309 -u root < ~/Desktop/export-to-planetscale-*.sql
```

### Opção B: Via MySQL Workbench (Visual)

1. Baixe MySQL Workbench
2. Configure conexão com PlanetScale
3. Importe o arquivo SQL

---

## 🎯 Passo 6: Atualizar Prisma Schema

Atualize `prisma/schema.prisma`:

```prisma
datasource db {
  provider     = "mysql"
  url          = env("DATABASE_URL")
  relationMode = "prisma"  // IMPORTANTE: PlanetScale não suporta foreign keys
}
```

Execute:
```bash
npx prisma generate
```

---

## 🎯 Passo 7: Atualizar Variáveis de Ambiente

Atualize `.env`:

```bash
# Comentar Cloud SQL
# DATABASE_URL="mysql://kzstore_app:Kzstore2024!@127.0.0.1:3307/kzstore_prod"

# Nova connection string PlanetScale
DATABASE_URL="mysql://SEU_USERNAME:SUA_PASSWORD@aws.connect.psdb.cloud/kzstore-prod?sslaccept=strict"
```

---

## 🎯 Passo 8: Testar Localmente

```bash
# 1. Instalar dependências (se necessário)
npm install

# 2. Testar conexão Prisma
npx prisma db pull

# 3. Iniciar servidor local
npm run dev

# 4. Testar API
curl http://localhost:5000/api/products?limit=5
```

---

## 🎯 Passo 9: Deploy para Cloud Run

```bash
# 1. Atualizar variável de ambiente no Cloud Run
gcloud run services update kzstore \
  --region=europe-southwest1 \
  --update-env-vars="DATABASE_URL=mysql://USERNAME:PASSWORD@aws.connect.psdb.cloud/kzstore-prod?sslaccept=strict"

# 2. Fazer novo deploy
npm run build
gcloud run deploy kzstore \
  --source . \
  --region=europe-southwest1 \
  --platform=managed \
  --quiet
```

---

## 🎯 Passo 10: Verificar e Finalizar

```bash
# 1. Testar site em produção
curl https://kzstore-341392738431.europe-southwest1.run.app/api/products?limit=1

# 2. Verificar admin panel
# Acesse: https://kzstore.ao/admin

# 3. Fazer pedido teste
# Verifique se tudo funciona
```

---

## 🎯 Passo 11: Desativar Cloud SQL (Após 1 semana de testes)

**IMPORTANTE**: Só faça isso após confirmar que tudo está funcionando!

```bash
# 1. Fazer backup final
gcloud sql export sql kzstore-01 \
  gs://kzstore-backups-202512/final-backup-$(date +%Y%m%d).sql \
  --database=kzstore_prod

# 2. Parar instância (não deleta, só pausa faturamento)
gcloud sql instances patch kzstore-01 --activation-policy=NEVER

# 3. Após 30 dias, se tudo OK, deletar
# gcloud sql instances delete kzstore-01
```

---

## 📊 Checklist Final

- [ ] PlanetScale funcionando
- [ ] Todos os produtos aparecem
- [ ] Pedidos podem ser criados
- [ ] Admin panel funciona
- [ ] Emails funcionam
- [ ] Backups automáticos ativos no PlanetScale
- [ ] Cloud SQL desativado

---

## 🆘 Rollback (se algo der errado)

```bash
# Voltar para Cloud SQL rapidamente
gcloud sql instances patch kzstore-01 --activation-policy=ALWAYS

# Atualizar variável no Cloud Run
gcloud run services update kzstore \
  --region=europe-southwest1 \
  --update-env-vars="DATABASE_URL=mysql://kzstore_app:Kzstore2024!@localhost/kzstore_prod?socket=/cloudsql/kzstore-477422:europe-southwest1:kzstore-01"
```

---

## 💡 Dicas

1. **Não delete o Cloud SQL imediatamente** - Espere 1-2 semanas
2. **Mantenha os backups** no Cloud Storage
3. **PlanetScale faz backups automáticos** - Verifique nas configurações
4. **Use branches** no PlanetScale para testar mudanças no schema

---

## 🎉 Resultado Final

**Economia mensal**: €50-65
**Economia anual**: €600-780
**Performance**: Igual ou melhor
**Manutenção**: Zero
**Escalabilidade**: Automática

---

## 📞 Próximos Passos

1. Crie a conta PlanetScale agora
2. Me avise quando estiver pronto
3. Vou te ajudar com cada passo da migração
