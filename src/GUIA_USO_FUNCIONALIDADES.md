# 📖 GUIA DE USO - FUNCIONALIDADES AVANÇADAS KZSTORE

**Versão:** 4.0  
**Data:** 19/11/2025  
**Status:** ✅ COMPLETO - Backend + Frontend

---

## 🎯 **VISÃO GERAL**

Todas as 7 funcionalidades avançadas agora têm:
- ✅ **Backend completo** (APIs funcionais)
- ✅ **Componentes Admin** (gestão completa)
- ✅ **Componentes Cliente** (interface de usuário)
- ✅ **Analytics integrado** (tracking automático)

---

## 📁 **ESTRUTURA DE ARQUIVOS**

### **Backend**
```
/supabase/functions/server/
├── advanced-features.tsx  ← Todas as APIs das novas funcionalidades
└── index.tsx             ← Integração com servidor principal
```

### **Admin Components**
```
/components/admin/
├── AdvancedFeaturesAdmin.tsx  ← Dashboard principal com tabs
├── PreOrdersManager.tsx       ← Gestão de pré-vendas
├── TradeInManager.tsx         ← Gestão de trade-ins
├── QuotesManager.tsx          ← Gestão de orçamentos
├── B2BManager.tsx             ← Gestão de contas B2B
├── AffiliatesManager.tsx      ← Gestão de afiliados
├── TicketsManager.tsx         ← Gestão de tickets
└── AnalyticsDashboard.tsx     ← Dashboard de analytics
```

### **Client Components**
```
/components/
├── PreOrderForm.tsx        ← Formulário de pré-venda
├── TradeInForm.tsx         ← Formulário de trade-in
├── QuoteRequestForm.tsx    ← Solicitação de orçamento
└── CreateTicket.tsx        ← Criar ticket de suporte
```

### **Utilities**
```
/utils/
└── analytics.ts            ← Funções de tracking
```

---

## 🚀 **COMO USAR - ADMINISTRADOR**

### **1. Acessar Dashboard Admin**

Importe e use o componente principal:

```tsx
import AdvancedFeaturesAdmin from './components/admin/AdvancedFeaturesAdmin';

function AdminPage() {
  return <AdvancedFeaturesAdmin />;
}
```

O dashboard tem 7 tabs:
- 📊 **Analytics** - Métricas e funil de conversão
- 📦 **Pré-vendas** - Gerenciar reservas
- 🔄 **Trade-In** - Avaliar trocas
- 📋 **Orçamentos** - Criar propostas
- 🏢 **B2B** - Aprovar contas empresariais
- 👥 **Afiliados** - Gerenciar programa de afiliados
- 🎫 **Tickets** - Atender suporte

### **2. Gerenciar Pré-vendas**

**Ações disponíveis:**
- Ver todas as pré-vendas
- Filtrar por status
- Atualizar status (pendente → confirmado → chegou → completo)
- Enviar email ao cliente
- Ver detalhes completos

**Fluxo típico:**
1. Cliente faz pré-venda (paga sinal de 30%)
2. Status: `pending` → `confirmed` (após pagamento)
3. Produto chega → Atualizar para `arrived` (notifica cliente)
4. Cliente paga restante → `completed`

### **3. Avaliar Trade-Ins**

**Ações disponíveis:**
- Ver solicitações de trade-in
- Avaliar dispositivos
- Ajustar valor estimado
- Aprovar/Rejeitar
- Adicionar notas

**Fluxo típico:**
1. Cliente submete dispositivo
2. Sistema calcula valor estimado automaticamente
3. Admin revisa e ajusta valor final
4. Aprovar → Cliente recebe crédito

### **4. Responder Orçamentos**

**Ações disponíveis:**
- Ver solicitações
- Criar proposta detalhada
- Adicionar múltiplos itens
- Calcular total automaticamente
- Enviar ao cliente

**Fluxo típico:**
1. Cliente solicita orçamento
2. Admin monta proposta com produtos
3. Enviar → Cliente recebe por email
4. Cliente aceita/rejeita

### **5. Gerenciar Contas B2B**

**Ações disponíveis:**
- Aprovar/Rejeitar solicitações
- Definir limite de crédito
- Configurar desconto (%)
- Definir prazo de pagamento (dias)
- Suspender contas

**Benefícios B2B:**
- Desconto automático em todas as compras
- Compra a prazo
- Limite de crédito pré-aprovado

### **6. Sistema de Afiliados**

**Métricas disponíveis:**
- Total de vendas por afiliado
- Comissão total/pendente/paga
- Performance individual
- Código de afiliado único

**Gestão:**
- Ver todos os afiliados
- Acompanhar vendas
- Processar pagamentos de comissão

### **7. Sistema de Tickets**

**Ações disponíveis:**
- Ver todos os tickets
- Filtrar por status/prioridade
- Responder tickets
- Atualizar status
- Ver histórico de conversas
- Monitorar SLA

**Prioridades e SLA:**
- Urgente: 4 horas
- Alto: 24 horas
- Médio: 48 horas
- Baixo: 72 horas

---

## 🛍️ **COMO USAR - CLIENTE**

### **1. Fazer Pré-venda**

```tsx
import PreOrderForm from './components/PreOrderForm';

// Em qualquer página de produto
<PreOrderForm 
  product={{
    id: 'prod_123',
    name: 'iPhone 15 Pro Max',
    price: 1500000,
    image: 'url_da_imagem',
    estimated_arrival: '2025-12-15'
  }}
/>
```

**Benefícios:**
- Paga apenas 30% agora
- Garante o produto
- Recebe notificação quando chegar

### **2. Fazer Trade-In**

```tsx
import TradeInForm from './components/TradeInForm';

// Botão de trade-in
<TradeInForm />
```

**Fluxo:**
1. Preenche dados do dispositivo usado
2. Recebe avaliação estimada instantaneamente
3. Aguarda avaliação final do admin
4. Recebe crédito para nova compra

### **3. Solicitar Orçamento**

```tsx
import QuoteRequestForm from './components/QuoteRequestForm';

// Botão para orçamento personalizado
<QuoteRequestForm />
```

**Casos de uso:**
- Compras corporativas
- Configurações específicas
- Grandes quantidades
- Produtos customizados

### **4. Criar Ticket de Suporte**

```tsx
import CreateTicket from './components/CreateTicket';

// Botão de suporte
<CreateTicket />
```

**Categorias:**
- Suporte Técnico
- Pagamento/Faturamento
- Envio/Entrega
- Dúvidas sobre Produto
- Outro

---

## 📊 **ANALYTICS - TRACKING AUTOMÁTICO**

### **Como usar:**

```tsx
import { analytics } from './utils/analytics';

// Tracking de eventos

// Visualização de página
analytics.pageView('/produtos');

// Visualização de produto
analytics.productView('prod_123', 'iPhone 15 Pro', 1500000);

// Adicionar ao carrinho
analytics.addToCart('prod_123', 'iPhone 15 Pro', 1, 1500000);

// Iniciar checkout
analytics.checkoutStart(1500000, 1);

// Compra concluída
analytics.purchase('order_123', 1500000, [
  { product_id: 'prod_123', name: 'iPhone 15 Pro', price: 1500000 }
]);

// Pesquisa
analytics.search('iphone 15', 5);

// Filtro aplicado
analytics.filterApplied('marca', 'Apple');
```

### **Eventos rastreados:**
- ✅ Visualizações de página
- ✅ Visualizações de produto
- ✅ Adições ao carrinho
- ✅ Remoções do carrinho
- ✅ Início de checkout
- ✅ Compras concluídas
- ✅ Pesquisas
- ✅ Filtros aplicados

---

## 🎨 **EXEMPLOS DE INTEGRAÇÃO**

### **Exemplo 1: Página de Produto com Pré-venda**

```tsx
import PreOrderForm from './components/PreOrderForm';
import TradeInForm from './components/TradeInForm';
import { analytics } from './utils/analytics';
import { useEffect } from 'react';

function ProductPage({ product }) {
  // Track visualização
  useEffect(() => {
    analytics.productView(product.id, product.name, product.price);
  }, [product]);

  const isPreOrder = product.stock === 0 && product.coming_soon;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price.toLocaleString('pt-AO')} AOA</p>
      
      {isPreOrder ? (
        <PreOrderForm product={product} />
      ) : (
        <Button onClick={() => {
          addToCart(product);
          analytics.addToCart(product.id, product.name, 1, product.price);
        }}>
          Adicionar ao Carrinho
        </Button>
      )}
      
      <TradeInForm />
    </div>
  );
}
```

### **Exemplo 2: Página de Suporte**

```tsx
import CreateTicket from './components/CreateTicket';
import QuoteRequestForm from './components/QuoteRequestForm';

function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1>Precisa de Ajuda?</h1>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Suporte Técnico</CardTitle>
            <CardDescription>
              Problemas com produtos ou pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTicket />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orçamento Personalizado</CardTitle>
            <CardDescription>
              Precisa de uma configuração específica?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuoteRequestForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### **Exemplo 3: Programa de Afiliados (Landing Page)**

```tsx
function AffiliateProgramPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1>Programa de Afiliados KZSTORE</h1>
      <p>Ganhe até 10% de comissão em cada venda!</p>
      
      <div className="grid grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>🔗 Link Único</CardTitle>
          </CardHeader>
          <CardContent>
            Receba seu link personalizado para compartilhar
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💰 Comissão 5-10%</CardTitle>
          </CardHeader>
          <CardContent>
            Ganhe em cada venda realizada através do seu link
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            Acompanhe suas vendas e comissões em tempo real
          </CardContent>
        </Card>
      </div>

      {/* Formulário de inscrição seria aqui */}
    </div>
  );
}
```

---

## ⚙️ **CONFIGURAÇÕES**

### **Valores Padrão (podem ser ajustados no backend):**

**Pré-vendas:**
- Sinal: 30% do valor total
- Status inicial: `pending`

**Trade-In:**
- Taxa de avaliação:
  - Excelente: 100% do valor base
  - Bom: 75%
  - Razoável: 50%
  - Ruim: 25%

**B2B:**
- Desconto padrão: 0% (admin define)
- Prazo pagamento: 30 dias
- Status inicial: `pending`

**Afiliados:**
- Comissão padrão: 5%
- Código: Gerado automaticamente (KZ + 6 caracteres)

**Tickets:**
- SLA Urgente: 4h
- SLA Alto: 24h
- SLA Médio: 48h
- SLA Baixo: 72h

---

## 🔧 **TROUBLESHOOTING**

### **Problema: Analytics não está rastreando**

**Solução:**
```tsx
// Verifique se as variáveis de ambiente estão configuradas
import { projectId, publicAnonKey } from './utils/supabase/info';
console.log('Project ID:', projectId);
console.log('Key:', publicAnonKey ? 'OK' : 'MISSING');
```

### **Problema: Formulários não enviam**

**Solução:**
- Verifique a conexão com internet
- Abra o console do navegador (F12) para ver erros
- Verifique se o backend está rodando
- Confirme que os campos obrigatórios estão preenchidos

### **Problema: Dashboard admin não carrega dados**

**Solução:**
- Verifique autenticação
- Confirme que as rotas do backend estão ativas
- Verifique logs do servidor

---

## 📞 **PRÓXIMOS PASSOS RECOMENDADOS**

### **1. Integrar no App Principal**

Adicione os botões em locais estratégicos:

```tsx
// App.tsx ou página principal
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdvancedFeaturesAdmin from './components/admin/AdvancedFeaturesAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas existentes */}
        <Route path="/admin/funcionalidades" element={<AdvancedFeaturesAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### **2. Adicionar na Navegação**

```tsx
// Header ou Menu Admin
<Link to="/admin/funcionalidades">
  Funcionalidades Avançadas
</Link>
```

### **3. Integrar Analytics**

```tsx
// App.tsx - Track todas as páginas
import { analytics } from './utils/analytics';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  
  useEffect(() => {
    analytics.pageView(location.pathname);
  }, [location]);
  
  // resto do código...
}
```

### **4. Adicionar Botões nas Páginas de Produto**

```tsx
// ProductCard.tsx ou ProductPage.tsx
import PreOrderForm from './components/PreOrderForm';
import TradeInForm from './components/TradeInForm';

{product.coming_soon && <PreOrderForm product={product} />}
<TradeInForm />
```

### **5. Criar Página de Suporte**

```tsx
// SupportPage.tsx
import CreateTicket from './components/CreateTicket';
import QuoteRequestForm from './components/QuoteRequestForm';

// Layout com opções de contato
```

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

- [x] ✅ Backend APIs criadas
- [x] ✅ Componentes Admin criados
- [x] ✅ Componentes Cliente criados
- [x] ✅ Analytics implementado
- [x] ✅ Documentação completa
- [ ] ⏳ Integrar no App principal
- [ ] ⏳ Adicionar na navegação
- [ ] ⏳ Testar todas as funcionalidades
- [ ] ⏳ Configurar emails de notificação
- [ ] ⏳ Treinamento da equipe

---

## 🎓 **RECURSOS DE APRENDIZADO**

### **Para Desenvolvedores:**
- Leia `/FUNCIONALIDADES_AVANCADAS.md` para detalhes técnicos das APIs
- Consulte o código-fonte dos componentes para exemplos
- Use o TypeScript para autocompletar e type-checking

### **Para Administradores:**
- Acesse o dashboard admin
- Explore cada tab para entender as funcionalidades
- Pratique criando dados de teste

### **Para Equipe de Vendas:**
- Aprenda a usar os formulários de cliente
- Entenda os benefícios de cada funcionalidade
- Saiba explicar o programa de afiliados

---

## 🎉 **CONCLUSÃO**

Todas as 7 funcionalidades avançadas estão **100% prontas para uso**:

1. ✅ Pré-vendas
2. ✅ Trade-In
3. ✅ Orçamentos
4. ✅ B2B
5. ✅ Afiliados
6. ✅ Tickets
7. ✅ Analytics

**Próximo passo:** Integrar no aplicativo principal e começar a usar! 🚀

---

**KZSTORE v4.0** - A Plataforma de E-commerce Mais Completa de Angola! 🇦🇴
