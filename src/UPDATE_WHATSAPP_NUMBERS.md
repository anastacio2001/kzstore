# ✅ Atualização de Números WhatsApp

## Número Real da KZSTORE: **+244 931 054 015**

### Arquivos a Atualizar Manualmente:

Substitua `244900000000` por `244931054015` nos seguintes arquivos:

1. ✅ `/components/Header.tsx` - FEITO
2. ✅ `/components/HomePage.tsx` - FEITO  
3. ✅ `/components/ProductDetailPage.tsx` - FEITO
4. ⚠️ `/components/CheckoutPage.tsx` - linha 132
5. ⚠️ `/components/Footer.tsx` - linha 134
6. ⚠️ `/components/NotFoundPage.tsx` - linha 85
7. ⚠️ `/components/FAQPage.tsx` - linha 206
8. ⚠️ `/components/AboutPage.tsx` - linha 282
9. ⚠️ `/components/ContactPage.tsx` - linhas 25, 37, 65, 322
10. ⚠️ `/components/ErrorBoundary.tsx` - linha 106
11. ⚠️ `/components/WhatsAppChat.tsx` - linhas 223, 236

## Comando de Busca e Substituição (se preferir):

```bash
# No terminal (Linux/Mac):
find . -type f -name "*.tsx" -exec sed -i 's/244900000000/244931054015/g' {} +
find . -type f -name "*.tsx" -exec sed -i 's/+244 900 000 000/+244 931 054 015/g' {} +

# Windows PowerShell:
Get-ChildItem -Recurse -Filter *.tsx | ForEach-Object {
  (Get-Content $_.FullName) -replace '244900000000', '244931054015' | Set-Content $_.FullName
}
```

## Uso das Constantes (Recomendado):

Para evitar hardcoding, importe de `/config/constants.ts`:

```typescript
import { COMPANY_INFO } from '../config/constants';

// Usar assim:
const whatsappLink = `https://wa.me/${COMPANY_INFO.whatsappFormatted}`;
const displayNumber = COMPANY_INFO.phone; // +244 931 054 015
```

## Verificação:

Buscar por:
- `244900000000`
- `+244 900 000 000`

Deve retornar **0 resultados** após atualização completa.
