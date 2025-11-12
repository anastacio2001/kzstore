# 🔧 TROUBLESHOOTING - KZSTORE

## 🚨 Erro: "permission denied for table users"

### **Causa:**
Row Level Security (RLS) está bloqueando acesso às tabelas.

### **Solução Rápida:**

**1. Executar migration no Supabase:**

Acesse: https://supabase.com/dashboard/project/duxeeawfyxcciwlyjllk/sql/new

Cole e execute:
```sql
-- Desabilitar RLS em todas as tabelas (desenvolvimento)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates DISABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks DISABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE pre_sale_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE pre_sale_reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
```

**OU** use o arquivo: `supabase/migrations/fix_all_permissions.sql`

---

## 🔗 Problema: Página de Afiliados não carrega

### **Verificar:**

1. **RLS está desabilitado?**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('affiliates', 'affiliate_links', 'affiliate_sales');
```

Resultado esperado: `rowsecurity = false` para todas

2. **Tabelas existem?**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'affiliate%';
```

3. **Usuário está autenticado?**
- Verificar se `user` não é null
- Verificar se `user.email` existe

### **Solução:**

Se tabelas não existem, executar migration:
```sql
-- Em: supabase/migrations/20251109140400_create_affiliate_system.sql
```

---

## 📊 Analytics não está rastreando

### **Verificar:**

1. **Variáveis de ambiente configuradas?**
```bash
# No Vercel Dashboard → Settings → Environment Variables
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FB_PIXEL_ID=YOUR_PIXEL_ID
```

2. **Analytics inicializado?**

Verificar no console do navegador:
```
📊 Google Analytics 4 inicializado
📘 Facebook Pixel inicializado
```

3. **Bloqueadores de anúncios?**
- Desabilitar AdBlock/uBlock
- Testar em navegação anônima

### **Solução:**

**App.tsx:**
```tsx
import { initAnalytics } from './utils/analytics';

useEffect(() => {
  initAnalytics();
}, []);
```

---

## 🖼️ Imagens não carregam com OptimizedImage

### **Verificar:**

1. **URLs das imagens válidas?**
2. **CORS configurado no Supabase Storage?**

### **Solução:**

Supabase Dashboard → Storage → Bucket Settings → CORS:
```json
[
  {
    "allowedOrigins": ["*"],
    "allowedMethods": ["GET"],
    "allowedHeaders": ["*"],
    "maxAge": 3600
  }
]
```

---

## 🛡️ Rate Limiting muito agressivo

### **Sintoma:**
"Muitas tentativas. Aguarde X segundos"

### **Solução:**

Ajustar configurações em `src/utils/rateLimiter.ts`:

```typescript
export const RATE_LIMIT_CONFIGS = {
  COUPON: {
    maxAttempts: 10, // Era 5, aumentar para 10
    windowMs: 60000,
    blockDurationMs: 300000
  }
}
```

**OU** resetar manualmente:
```tsx
import { resetRateLimit } from '../utils/rateLimiter';

resetRateLimit('COUPON', fingerprint);
```

---

## 🔍 Busca Avançada não filtra

### **Verificar:**

1. **AdvancedSearch está integrado?**
```tsx
import { AdvancedSearch } from './components/AdvancedSearch';

<AdvancedSearch 
  products={products}
  onSearchResults={setFilteredProducts}
/>
```

2. **Estado está sendo atualizado?**
```tsx
const [filteredProducts, setFilteredProducts] = useState(products);

// Usar filteredProducts no mapeamento
{filteredProducts.map(product => ...)}
```

---

## 💳 Cupons não incrementam used_count

### **Verificar:**

1. **Migration executada?**
```sql
-- Verificar se trigger existe
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
AND trigger_name = 'trigger_increment_coupon_usage';
```

2. **Pedido tem coupon_code?**
```sql
SELECT id, coupon_code, discount_amount 
FROM orders 
WHERE coupon_code IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5;
```

### **Solução:**

Executar: `supabase/migrations/increment_coupon_usage.sql`

---

## 📧 Emails de notificação não enviam

### **Causa:**
Trigger SQL requer extensão pgsql-http (não disponível em Supabase por padrão)

### **Solução Alternativa:**

**Opção 1:** Usar Supabase Edge Functions
```bash
npx supabase functions new send-order-notification
```

**Opção 2:** Implementar no frontend
```tsx
// Após atualizar status do pedido
const sendEmail = async (order) => {
  await fetch('/api/send-email', {
    method: 'POST',
    body: JSON.stringify(order)
  });
};
```

**Opção 3:** Usar webhook externo (Zapier, Make.com)

---

## 🎯 Dashboard do Cliente vazio

### **Verificar:**

1. **Usuário autenticado?**
```tsx
const { user } = useAuth();
console.log('User:', user);
```

2. **Pedidos existem?**
```sql
SELECT * FROM orders 
WHERE user_id = 'USER_ID' 
OR customer_email = 'EMAIL';
```

3. **Loyalty points configurado?**
```sql
SELECT * FROM loyalty_points 
WHERE user_id = 'USER_ID';
```

---

## 🔄 Deploy do Vercel falhou

### **Verificar:**

1. **Build logs no Vercel Dashboard**
2. **Variáveis de ambiente configuradas?**

### **Comandos úteis:**

```bash
# Testar build local
npm run build

# Ver logs do Vercel
vercel logs

# Redeployar
git commit --allow-empty -m "Trigger deploy"
git push
```

---

## 🗂️ Migrations SQL para executar

**Execute em ordem:**

1. ✅ `create_coupons_table.sql`
2. ✅ `increment_coupon_usage.sql`
3. ✅ `fix_all_permissions.sql` ⚠️ **IMPORTANTE**
4. ⏳ `notify_order_status.sql` (opcional - requer extensão)

---

## 📞 Suporte

**Logs úteis para debug:**

```bash
# Frontend (navegador)
Console → Filtrar por "Error"

# Supabase
Dashboard → Logs → Query Performance

# Vercel
Dashboard → Deployments → View Function Logs
```

**Informações para compartilhar:**
- URL onde ocorre o erro
- Mensagem de erro completa
- Console do navegador (F12)
- Ações que causam o erro

---

## ✅ Checklist de Verificação

Antes de reportar erro, verificar:

- [ ] Migrations SQL executadas?
- [ ] RLS desabilitado nas tabelas necessárias?
- [ ] Variáveis de ambiente configuradas no Vercel?
- [ ] Usuário está autenticado?
- [ ] Console do navegador sem erros?
- [ ] Deploy do Vercel concluído com sucesso?
- [ ] Cache do navegador limpo? (Ctrl+Shift+R)

---

**Última atualização:** Fase 2 - Novembro 2025
