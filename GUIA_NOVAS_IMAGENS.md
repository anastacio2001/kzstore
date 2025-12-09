# 📸 Guia: Como Adicionar Novas Imagens de Produtos

Todas as imagens agora estão hospedadas no **Google Cloud Storage** para funcionar perfeitamente em mobile e desktop!

## ✅ Método 1: Upload via Admin Panel (RECOMENDADO)

### Quando criar/editar um produto:

1. **No painel admin**, ao criar/editar produto
2. **Fazer upload da imagem** usando o botão de upload
3. O sistema automaticamente:
   - Faz upload para `gs://kzstore-images/`
   - Gera URL público: `https://storage.googleapis.com/kzstore-images/product-xxx.jpg`
   - Salva o URL na base de dados

### API Endpoint:
```bash
POST https://kzstore-341392738431.europe-southwest1.run.app/api/upload
Content-Type: multipart/form-data

# Form field: "image" (arquivo)
```

**Resposta:**
```json
{
  "success": true,
  "url": "https://storage.googleapis.com/kzstore-images/product-1733397600000-123456789.jpg",
  "filename": "product-1733397600000-123456789.jpg"
}
```

---

## 🛠️ Método 2: Upload Manual via Terminal

### 1. Upload de uma imagem:
```bash
gsutil cp /caminho/da/imagem.jpg gs://kzstore-images/produto-nome.jpg
```

### 2. Verificar se foi publicada:
```bash
curl -I https://storage.googleapis.com/kzstore-images/produto-nome.jpg
# Deve retornar: HTTP/2 200
```

### 3. Usar o URL no produto:
```
https://storage.googleapis.com/kzstore-images/produto-nome.jpg
```

---

## 📦 Método 3: Upload de Múltiplas Imagens

### Via Terminal:
```bash
# Upload de uma pasta inteira
gsutil -m cp -r /caminho/da/pasta/* gs://kzstore-images/

# Upload com padrão
gsutil -m cp /caminho/*.jpg gs://kzstore-images/
```

### Via API:
```bash
POST https://kzstore-341392738431.europe-southwest1.run.app/api/upload-multiple
Content-Type: multipart/form-data

# Form field: "images" (até 5 arquivos)
```

---

## 🔧 Gestão do Bucket

### Listar todas as imagens:
```bash
gsutil ls gs://kzstore-images/
```

### Ver detalhes:
```bash
gsutil ls -l gs://kzstore-images/
```

### Apagar uma imagem:
```bash
gsutil rm gs://kzstore-images/imagem-antiga.jpg
```

### Copiar imagem de URL externa:
```bash
# Download local primeiro
curl -o temp.jpg "https://site-externo.com/imagem.jpg"

# Upload para bucket
gsutil cp temp.jpg gs://kzstore-images/produto-novo.jpg

# Limpar
rm temp.jpg
```

---

## ⚙️ Configuração Atual

- **Bucket**: `kzstore-images`
- **Região**: `europe-southwest1` (Madrid)
- **Acesso**: Público (leitura)
- **URL Base**: `https://storage.googleapis.com/kzstore-images/`
- **Formato dos nomes**: `product-{timestamp}-{random}.{ext}`

---

## ✨ Vantagens

✅ **Sem erros 403** - Imagens funcionam em todos os dispositivos  
✅ **CDN Global** - Google Cloud CDN distribui automaticamente  
✅ **Cache eficiente** - Headers otimizados (`max-age=31536000`)  
✅ **Escalável** - Suporta milhares de imagens  
✅ **Seguro** - Backup automático do Google  
✅ **Barato** - ~$0.02/GB/mês de armazenamento  

---

## 🚨 Importante

- **Sempre usar o bucket `kzstore-images`** para todas as imagens de produtos
- **Não usar URLs externos** (causam erro 403 no mobile)
- **Manter nomes únicos** para evitar conflitos
- **Formatos recomendados**: JPG, PNG, WEBP
- **Tamanho máximo**: 5MB por imagem (via API)

---

## 📊 Status Atual

- ✅ **60 produtos migrados** com sucesso
- ✅ **Bucket configurado** e público
- ✅ **API de upload** funcionando
- ✅ **Imagens carregando** em mobile e desktop

**Última atualização**: 5 dezembro 2025
**Revisão**: kzstore-00018-ndq
