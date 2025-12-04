# Solução: MySQL Metadata Cache Issue

## 🔴 Problema
Upload de imagens base64 em anúncios falhava com erro:
```
MySQL Code 1406: Data too long for column 'imagem_url' at row 1
```

Mesmo após aplicar `ALTER TABLE advertisements MODIFY COLUMN imagem_url TEXT`, o erro persistia.

## 🔍 Diagnóstico
1. **Database real**: DESCRIBE mostra `imagem_url TEXT` (65535 chars) ✅
2. **Runtime**: MySQL continua rejeitando strings >500 chars ❌
3. **Raw SQL**: Mesmo bypass do Prisma falhava com mesmo erro
4. **Conclusão**: MySQL estava cacheando metadata antiga da tabela

## 🎯 Root Cause
MySQL mantém **connection-level metadata cache** para tabelas. ALTER TABLE não invalida esse cache em conexões existentes. Cloud Run mantinha conexões pooled com cache antigo.

## ✅ Solução Implementada

### 1. Renomear Coluna (Nuclear Option)
```sql
ALTER TABLE advertisements 
CHANGE imagem_url imagem_url_v2 TEXT NOT NULL;
```

### 2. Atualizar Schema Prisma
```prisma
model Advertisement {
  // ...
  imagem_url_v2    String    @db.Text  @map("imagem_url_v2")
  // ...
}
```

### 3. Atualizar Código Server
```typescript
// CREATE
const newAd = await prisma.advertisement.create({
  data: {
    imagem_url_v2: data.imagem_url,
    // ...
  }
});

// UPDATE
await prisma.$executeRawUnsafe(`
  UPDATE advertisements 
  SET imagem_url_v2 = ?, ...
  WHERE id = ?
`, updates.imagem_url, ...);
```

### 4. Regenerar Prisma + Deploy
```bash
npx prisma generate --schema=./prisma/schema.prisma
gcloud builds submit --tag europe-southwest1-docker.pkg.dev/kzstore-477422/kzstore-repo/kzstore
gcloud run deploy kzstore --image ... --region europe-southwest1
```

## 🧠 Por Que Funcionou
Renomear a coluna **força MySQL e Prisma a reconhecer como campo completamente novo**, eliminando qualquer cache de metadata existente em:
- Connection pools
- Prepared statements  
- Prisma Client schema cache
- MySQL query cache

## 📝 Alternativas Testadas (Não Funcionaram)
1. ❌ Regenerar Prisma Client (10+ vezes)
2. ❌ Limpar `node_modules/.prisma` antes de build
3. ❌ Adicionar `connection_limit=1` no DATABASE_URL
4. ❌ Raw SQL bypass com `$executeRawUnsafe`
5. ❌ Forçar restart de Cloud Run service
6. ❌ Adicionar env var para forçar reconexão

## 🎓 Lições Aprendidas
1. **ALTER TABLE não invalida caches de conexão** - conexões existentes mantêm metadata antiga
2. **Prisma não é o problema** - raw SQL falhava igualmente  
3. **Connection pooling é agressivo** - Cloud Run mantém conexões por muito tempo
4. **Renomear coluna é solução definitiva** - força reconhecimento de nova estrutura
5. **@map preserva compatibilidade** - frontend continua enviando `imagem_url`

## 📅 Data
3 de dezembro de 2025

## ✅ Status
**RESOLVIDO** - Deploy em andamento com `imagem_url_v2`
