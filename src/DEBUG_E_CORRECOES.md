# 🐛 DEBUG E CORREÇÕES - KZSTORE

**Data:** 19/11/2025  
**Status:** ✅ **LOGS ADICIONADOS PARA DEBUG**

---

## 🚨 **PROBLEMAS REPORTADOS**

### **1. ❌ Criar Cupom Não Funciona**
- **Sintoma:** Formulário preenche mas não cria o cupom
- **Ação:** Logs adicionados para debug

### **2. ❌ Atualizar Status de Pedido Não Funciona**
- **Sintoma:** Seleciona novo status mas não atualiza
- **Ação:** Logs adicionados para debug

### **3. ℹ️ Páginas "Anúncios" e "Equipe" Vazias**
- **Status:** Comportamento esperado (em desenvolvimento)
- **Ação:** Mensagem de "em desenvolvimento" já está lá

---

## 🔧 **CORREÇÕES APLICADAS**

### **1. Logs Detalhados em CouponsManager**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const couponData = {
    code: formData.code.toUpperCase(),
    type: formData.type,
    value: formData.value,
    min_purchase: formData.min_purchase || null,
    max_discount: formData.max_discount || null,
    usage_limit: formData.usage_limit || null,
    valid_from: new Date(formData.valid_from).toISOString(),
    valid_until: new Date(formData.valid_until).toISOString(),
    is_active: formData.is_active,
  };

  console.log('🎫 Creating/Updating coupon:', couponData);

  try {
    const url = editingCoupon
      ? `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/coupons/${editingCoupon.id}`
      : `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/coupons`;

    console.log('📡 Request URL:', url);
    console.log('📡 Method:', editingCoupon ? 'PUT' : 'POST');

    const response = await fetch(url, {
      method: editingCoupon ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken || publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(couponData),
    });

    console.log('📡 Response status:', response.status);
    const responseData = await response.json();
    console.log('📡 Response data:', responseData);

    if (response.ok) {
      console.log('✅ Coupon saved successfully!');
      await loadCoupons();
      setShowForm(false);
      setEditingCoupon(null);
      resetForm();
    } else {
      console.error('❌ Failed to save coupon:', responseData);
      alert(`Erro: ${responseData.error || 'Falha ao salvar cupom'}`);
    }
  } catch (error) {
    console.error('❌ Error saving coupon:', error);
    alert(`Erro ao salvar cupom: ${String(error)}`);
  }
};
```

**Logs que aparecerão no console:**
```
🎫 Creating/Updating coupon: {...}
📡 Request URL: https://...
📡 Method: POST
📡 Response status: 201
📡 Response data: {...}
✅ Coupon saved successfully!
```

**Se houver erro:**
```
❌ Failed to save coupon: { error: "...", details: "..." }
// OU
❌ Error saving coupon: ...
```

---

### **2. Logs Detalhados em OrderManagementComplete**

```typescript
const updateOrderStatus = async (orderId: string, newStatus: string, trackingCode?: string) => {
  setUpdating(orderId);
  console.log('📦 Updating order:', { orderId, newStatus, trackingCode });
  
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/orders/${orderId}`;
    console.log('📡 Request URL:', url);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken || publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newStatus,
        tracking_code: trackingCode,
      }),
    });

    console.log('📡 Response status:', response.status);
    const responseData = await response.json();
    console.log('📡 Response data:', responseData);

    if (response.ok) {
      console.log('✅ Order updated successfully!');
      await loadOrders();
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any, tracking_code: trackingCode } : null);
      }
    } else {
      console.error('❌ Failed to update order:', responseData);
      alert(`Erro: ${responseData.error || 'Falha ao atualizar pedido'}`);
    }
  } catch (error) {
    console.error('❌ Error updating order:', error);
    alert(`Erro ao atualizar pedido: ${String(error)}`);
  } finally {
    setUpdating(null);
  }
};
```

**Logs que aparecerão no console:**
```
📦 Updating order: { orderId: "...", newStatus: "shipped", trackingCode: "BR123..." }
📡 Request URL: https://...
📡 Response status: 200
📡 Response data: {...}
✅ Order updated successfully!
```

**Se houver erro:**
```
❌ Failed to update order: { error: "...", details: "..." }
// OU
❌ Error updating order: ...
```

---

## 🔍 **COMO DEBUGAR**

### **Passo 1: Abrir Console do Navegador**

1. **Chrome/Edge:** Pressione `F12` ou `Ctrl+Shift+I`
2. **Firefox:** Pressione `F12` ou `Ctrl+Shift+K`
3. **Safari:** `Cmd+Option+C`

### **Passo 2: Ir para a tab "Console"**

Procure pela aba "Console" ou "Consola"

### **Passo 3: Tentar Criar Cupom**

1. Acesse Admin → Cupons
2. Clique em "Novo Cupom"
3. Preencha o formulário
4. Clique em "Criar Cupom"
5. **OBSERVE O CONSOLE**

### **Passo 4: Analisar Logs**

#### **Caso de Sucesso:**
```
🎫 Creating/Updating coupon: { code: "PRIMEIRACOMPRA", ... }
📡 Request URL: https://abcd1234.supabase.co/functions/v1/make-server-d8a4dffd/coupons
📡 Method: POST
📡 Response status: 201
📡 Response data: { coupon: {...}, message: "..." }
✅ Coupon saved successfully!
```

#### **Caso de Erro - Autenticação:**
```
📡 Response status: 401
📡 Response data: { error: "Unauthorized" }
❌ Failed to save coupon: { error: "Unauthorized" }
```
**Solução:** Fazer logout e login novamente

#### **Caso de Erro - Validação:**
```
📡 Response status: 400
📡 Response data: { error: "Invalid coupon data", details: "..." }
❌ Failed to save coupon: { error: "Invalid coupon data" }
```
**Solução:** Verificar se todos os campos obrigatórios estão preenchidos

#### **Caso de Erro - Servidor:**
```
📡 Response status: 500
📡 Response data: { error: "Internal Server Error", details: "..." }
❌ Failed to save coupon: { error: "Internal Server Error" }
```
**Solução:** Verificar logs do servidor Supabase

#### **Caso de Erro - Rede:**
```
❌ Error saving coupon: TypeError: Failed to fetch
```
**Solução:** Verificar conexão com internet

---

## 🎯 **POSSÍVEIS CAUSAS DOS PROBLEMAS**

### **1. Token de Autenticação Expirado**

**Sintomas:**
- Response status: 401
- Error: "Unauthorized"

**Solução:**
```typescript
// Fazer logout e login novamente
// Ou verificar se accessToken está sendo passado corretamente
console.log('Access Token:', accessToken?.substring(0, 20) + '...');
```

### **2. Rota do Backend Não Existe**

**Sintomas:**
- Response status: 404
- Error: "Not Found"

**Solução:**
Verificar se as rotas estão registradas em `/supabase/functions/server/index.tsx`:
```typescript
app.route('/make-server-d8a4dffd/coupons', couponRoutes);
app.route('/make-server-d8a4dffd/orders', orderRoutes);
```

### **3. CORS Error**

**Sintomas:**
- Error no console: "CORS policy..."
- Requisição não chega ao servidor

**Solução:**
Verificar configuração CORS em `/supabase/functions/server/index.tsx`:
```typescript
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));
```

### **4. Dados Inválidos**

**Sintomas:**
- Response status: 400
- Error: "Invalid data"

**Solução:**
Verificar se todos os campos obrigatórios estão preenchidos:
- Cupom: `code`, `type`, `value`, `valid_from`, `valid_until`
- Pedido: `orderId`, `status`

### **5. Servidor Supabase Offline**

**Sintomas:**
- Timeout
- Error: "Failed to fetch"

**Solução:**
1. Verificar status do Supabase: https://status.supabase.com
2. Verificar se o projeto está ativo
3. Verificar URL do projeto

---

## 📋 **CHECKLIST DE DEBUG**

### **Antes de Criar Cupom:**
- [ ] Está logado como admin?
- [ ] Console do navegador está aberto?
- [ ] Tab "Console" está selecionada?

### **Ao Criar Cupom:**
- [ ] Todos os campos obrigatórios preenchidos?
- [ ] Código tem apenas letras e números?
- [ ] Data "Válido De" < Data "Válido Até"?
- [ ] Valor > 0?

### **Após Clicar "Criar Cupom":**
- [ ] Logs aparecem no console?
- [ ] Qual é o Response Status?
- [ ] Aparece mensagem de erro?
- [ ] Aparece alerta na tela?

---

## 🆘 **COMO REPORTAR ERROS**

Se os problemas persistirem, copie e envie as seguintes informações:

### **1. Logs do Console:**
```
🎫 Creating/Updating coupon: {...}
📡 Request URL: https://...
📡 Method: POST
📡 Response status: XXX
📡 Response data: {...}
❌ Failed to save coupon: ...
```

### **2. Screenshot da Tela:**
- Formulário preenchido
- Mensagem de erro (se houver)

### **3. Informações do Ambiente:**
- Navegador: Chrome/Firefox/Safari/Edge
- Versão do navegador
- Sistema Operacional
- Está em localhost ou produção?

### **4. Passos para Reproduzir:**
```
1. Acesso Admin
2. Cliquei em "Cupons"
3. Cliquei em "Novo Cupom"
4. Preenchi:
   - Código: PRIMEIRACOMPRA
   - Tipo: Percentual
   - Valor: 10%
   - Válido De: 19/11/2025 16:00
   - Válido Até: 22/11/2025 19:00
5. Cliquei em "Criar Cupom"
6. Resultado: [descrever o que aconteceu]
```

---

## 📊 **PÁGINAS "EM DESENVOLVIMENTO"**

### **Anúncios (AdsManager)**

**Status:** ✅ Funcional mas vazio

**Mensagem:**
```
Sistema de gestão de anúncios em desenvolvimento

Aqui você poderá criar e gerenciar banners, 
promoções e campanhas publicitárias
```

**Rotas Backend:** ✅ Implementadas em `/supabase/functions/server/ad-routes.tsx`

**Para Implementar Frontend:**
Criar componente similar aos outros managers:
- Listagem de anúncios
- Criar/Editar anúncio
- Upload de imagem
- Configurar posição (hero, sidebar, etc.)

---

### **Equipe (TeamManager)**

**Status:** ✅ Funcional mas vazio

**Mensagem:**
```
Sistema de gestão de equipe em desenvolvimento

Aqui você poderá adicionar membros da equipe 
e gerenciar permissões
```

**Rotas Backend:** ✅ Implementadas em `/supabase/functions/server/team-routes.tsx`

**Para Implementar Frontend:**
Criar componente similar aos outros managers:
- Listagem de membros
- Adicionar/Remover membro
- Definir cargo e permissões
- Gerenciar acesso

---

## ✅ **PRÓXIMOS PASSOS**

### **URGENTE (Agora):**
1. [ ] Abrir console do navegador
2. [ ] Tentar criar cupom
3. [ ] Copiar logs do console
4. [ ] Tentar atualizar status de pedido
5. [ ] Copiar logs do console
6. [ ] Enviar logs para análise

### **IMPORTANTE (Depois):**
1. [ ] Implementar frontend de Anúncios
2. [ ] Implementar frontend de Equipe
3. [ ] Adicionar mais validações
4. [ ] Melhorar mensagens de erro

---

## 🎊 **STATUS ATUAL**

```
╔════════════════════════════════════════════════════╗
║                                                    ║
║        ✅ LOGS DE DEBUG ADICIONADOS ✅             ║
║                                                    ║
║   COMPONENTES ATUALIZADOS:                         ║
║                                                    ║
║   🎫 CouponsManager                                ║
║      - Logs detalhados de criação                  ║
║      - Alertas de erro na tela                     ║
║      - Console logs formatados                     ║
║                                                    ║
║   📦 OrderManagementComplete                       ║
║      - Logs detalhados de atualização              ║
║      - Alertas de erro na tela                     ║
║      - Console logs formatados                     ║
║                                                    ║
║   PRÓXIMO PASSO: DEBUGAR NO CONSOLE                ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

---

**🔍 Agora abra o console do navegador e tente criar um cupom!**  
**Os logs vão mostrar exatamente onde está o problema.**

---

*Debug Tools implementados em 19/11/2025 - KZSTORE 🇦🇴*
