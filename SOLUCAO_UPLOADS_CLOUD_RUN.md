# Solução para Uploads em Cloud Run

## Problema Identificado

O erro "Safari non può connettersi al server" ao visualizar comprovantes de pagamento ocorria por **dois motivos**:

### 1. URLs Hardcoded com localhost
**Problema:** O servidor estava retornando URLs de upload com `http://localhost:8080/uploads/...`

**Correção Aplicada:**
```typescript
// ❌ ANTES (hardcoded)
const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

// ✅ DEPOIS (caminho relativo)
const imageUrl = `/uploads/${req.file.filename}`;
```

### 2. Cloud Run é Efêmero (Uploads não persistem)
**Problema:** Cloud Run não persiste arquivos locais entre restarts/redeploys.

**Status:** ⚠️ **PROBLEMA PARCIALMENTE RESOLVIDO**
- URLs agora são corretas e relativas
- Mas arquivos podem ser perdidos em restarts

## Soluções para Persistência de Uploads

### Opção 1: Google Cloud Storage (Recomendado) ⭐
Usar GCS Bucket para armazenar uploads permanentemente.

**Vantagens:**
- ✅ Persistência garantida
- ✅ CDN integrado
- ✅ Escalável
- ✅ Backup automático

**Implementação:**
```bash
# 1. Criar bucket
gsutil mb gs://kzstore-uploads

# 2. Tornar público
gsutil iam ch allUsers:objectViewer gs://kzstore-uploads

# 3. Instalar SDK
npm install @google-cloud/storage
```

```typescript
// server.ts
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucket = storage.bucket('kzstore-uploads');

// Configurar multer para GCS
const multerGCS = multer({
  storage: multer.memoryStorage(),
});

app.post('/api/upload', multerGCS.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada' });
  }

  const blob = bucket.file(`${Date.now()}-${req.file.originalname}`);
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  blobStream.on('error', (err) => {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  });

  blobStream.on('finish', () => {
    const publicUrl = `https://storage.googleapis.com/kzstore-uploads/${blob.name}`;
    res.json({ success: true, url: publicUrl });
  });

  blobStream.end(req.file.buffer);
});
```

### Opção 2: Volume Persistente (Cloud Run)
Usar volume montado do Cloud Storage FUSE.

**Limitações:**
- ⚠️ Mais complexo de configurar
- ⚠️ Requer permissões especiais
- ⚠️ Latência maior

### Opção 3: Cloud SQL Blob Storage
Armazenar imagens como BLOB no MySQL.

**Limitações:**
- ❌ Não recomendado para imagens grandes
- ❌ Afeta performance do banco
- ❌ Custo maior

## Status Atual

### ✅ IMPLEMENTADO - Google Cloud Storage Configurado!

**Data da Implementação:** 28/11/2025

#### Bucket Criado
```bash
Bucket: gs://kzstore-uploads
Região: europe-southwest1
Acesso público: Habilitado (roles/storage.objectViewer)
Permissões: Service account kzstore-db-access tem objectAdmin
```

#### Código Atualizado
1. ✅ **Instalado SDK:** `@google-cloud/storage`
2. ✅ **Upload único** (`/api/upload`): Envia para GCS e retorna URL pública
3. ✅ **Upload múltiplo** (`/api/upload-multiple`): Envia todos para GCS
4. ✅ **Upload de tickets** (`/api/tickets/:id/attachments`): Também usa GCS
5. ✅ **URLs públicas:** `https://storage.googleapis.com/kzstore-uploads/filename.jpg`

#### Arquivos Modificados no Deploy
- ✅ `server.ts` - Integração completa com GCS
- ✅ `package.json` - Dependência @google-cloud/storage adicionada
- ✅ Todas as rotas de upload migradas para GCS

### ✅ Correções Aplicadas (Anteriores)
1. URLs de upload agora usam caminhos corretos
2. Funciona em desenvolvimento e produção
3. Diretório `public/uploads` mantido como fallback local

### ✅ Benefícios da Implementação
- ✅ **Persistência garantida** - Arquivos não são perdidos em restarts
- ✅ **Escalabilidade** - GCS lida com qualquer volume de uploads
- ✅ **Performance** - CDN integrado do Google
- ✅ **Backup automático** - Google cuida da redundância
- ✅ **URLs públicas** - Acessíveis de qualquer lugar

## Recomendação Imediata

### ✅ CONCLUÍDO - Google Cloud Storage Implementado!

O bucket foi criado e todo o código foi migrado para usar GCS. Próximos uploads serão armazenados permanentemente em:
```
https://storage.googleapis.com/kzstore-uploads/
```

### ⚠️ Ação Necessária: Migrar Uploads Existentes

Os arquivos que já existiam na pasta local `public/uploads` precisam ser migrados manualmente para o GCS:

```bash
# Migrar todos os arquivos existentes
gsutil -m cp -r public/uploads/* gs://kzstore-uploads/

# Verificar uploads
gsutil ls gs://kzstore-uploads/
```

**Importante:** Após migrar, atualizar as URLs no banco de dados:
- Pré-vendas que têm comprovantes com URLs `/uploads/...`
- Produtos com imagens locais
- Anexos de tickets

Script SQL para atualização (executar após migração):
```sql
-- Atualizar URLs de payment_proof nas pré-vendas
UPDATE pre_orders 
SET payment_proof = REPLACE(payment_proof, '/uploads/', 'https://storage.googleapis.com/kzstore-uploads/')
WHERE payment_proof LIKE '/uploads/%';

-- Atualizar URLs de produtos
UPDATE products 
SET imagem_url = REPLACE(imagem_url, '/uploads/', 'https://storage.googleapis.com/kzstore-uploads/')
WHERE imagem_url LIKE '/uploads/%';
```

## Arquivos Afetados

**Corrigidos no Deploy:**
- ✅ `server.ts` (linhas 204, 227) - URLs de upload
- ✅ `Dockerfile` - Criação do diretório uploads

**A Verificar Após Deploy:**
- 🔍 Comprovantes de pré-vendas existentes
- 🔍 Imagens de produtos (podem estar perdidas)
- 🔍 Anexos de tickets

## Teste Após Deploy

```bash
# 1. Verificar se o bucket está acessível
gsutil ls gs://kzstore-uploads/

# 2. Fazer novo upload via API e verificar URL retornada
# (deve retornar https://storage.googleapis.com/kzstore-uploads/... )

# 3. Verificar se comprovantes de pré-vendas carregam
# (ir ao painel admin -> pré-vendas -> ver comprovante)

# 4. Testar upload de nova imagem de produto
# (criar produto com imagem e verificar se aparece corretamente)
```

### Checklist Pós-Deploy
- [ ] Deploy concluído com sucesso
- [ ] Testar upload de nova imagem de produto
- [ ] Testar upload de comprovante em nova pré-venda
- [ ] Migrar uploads existentes do local para GCS (gsutil cp)
- [ ] Atualizar URLs antigas no banco de dados (SQL acima)
- [ ] Verificar se imagens antigas carregam após migração

---

**Data:** 28/11/2025  
**Status:** ✅ Google Cloud Storage Implementado - Deploy em andamento  
**Próximo Passo:** Migrar arquivos existentes do local para GCS após deploy
