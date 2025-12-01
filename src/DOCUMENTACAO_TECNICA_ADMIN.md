# KZSTORE - Documentação Técnica do Painel Administrativo
## Sistema de Gestão Completo para E-commerce

**Versão:** 4.0  
**Data:** 25 de Novembro de 2024  
**Empresa:** KZSTORE (KwanzaStore)  
**Tecnologias:** React, TypeScript, Supabase, Tailwind CSS

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Autenticação e Segurança](#autenticação-e-segurança)
4. [Módulos do Painel](#módulos-do-painel)
5. [API Backend](#api-backend)
6. [Banco de Dados](#banco-de-dados)
7. [Fluxos de Trabalho](#fluxos-de-trabalho)
8. [Integrações Externas](#integrações-externas)

---

## 1. Visão Geral

### 1.1 Propósito

O Painel Administrativo KZSTORE é um sistema completo de gestão de e-commerce desenvolvido especificamente para o mercado angolano, permitindo controle total sobre:

- **Catálogo de Produtos** - Gestão completa de produtos técnicos
- **Gestão de Pedidos** - Acompanhamento de vendas e status
- **Clientes** - Base de dados de compradores
- **Marketing** - Cupons, flash sales, anúncios
- **Operações** - Pré-vendas, trade-in, cotações
- **Suporte** - Sistema de tickets
- **Equipe** - Gestão de colaboradores
- **Afiliados** - Programa de parcerias
- **Analytics** - Métricas e relatórios

### 1.2 Características Principais

✅ **Interface Unificada** - Um único painel para todas as operações  
✅ **Real-time** - Atualizações em tempo real via Supabase  
✅ **Multi-dispositivo** - Responsivo para desktop, tablet e mobile  
✅ **Seguro** - Autenticação JWT + RLS (Row Level Security)  
✅ **Escalável** - Arquitetura modular e componentizada  
✅ **Localizado** - Adaptado para Angola (Kwanzas, Multicaixa, WhatsApp)  

### 1.3 Tecnologias Utilizadas

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| **Frontend** | React | 18+ |
| **Linguagem** | TypeScript | 5+ |
| **Estilização** | Tailwind CSS | 4.0 |
| **Backend** | Supabase Edge Functions | - |
| **Banco de Dados** | PostgreSQL (Supabase) | 15+ |
| **Runtime Backend** | Deno | 1.40+ |
| **Framework Backend** | Hono | 4+ |
| **Armazenamento** | Supabase Storage | - |
| **Autenticação** | Supabase Auth | - |
| **Notificações** | Sonner (Toast) | 2.0.3 |
| **Ícones** | Lucide React | Latest |
| **AI Chatbot** | Google Gemini API | 1.5 |
| **Email** | Resend API | - |
| **Pagamentos** | Multicaixa Express | - |

---

## 2. Arquitetura do Sistema

### 2.1 Estrutura de Pastas

```
/
├── components/
│   ├── UnifiedAdminPanel.tsx          # 🔥 PAINEL PRINCIPAL
│   ├── admin/                         # Módulos administrativos
│   │   ├── AdminDashboard.tsx         # Dashboard com métricas
│   │   ├── ProductForm.tsx            # Formulário de produtos
│   │   ├── OrderManagement.tsx        # Gestão de pedidos
│   │   ├── CouponsManager.tsx         # Gestão de cupons
│   │   ├── FlashSalesManager.tsx      # Flash sales/promoções
│   │   ├── AdsManager.tsx             # Gestão de anúncios
│   │   ├── TeamManager.tsx            # Gestão de equipe
│   │   └── ...
│   └── ui/                            # Componentes UI reutilizáveis
├── hooks/
│   ├── useAuth.tsx                    # Hook de autenticação
│   ├── useAdminData.tsx               # Hook principal admin
│   ├── useProducts.tsx                # Gestão de produtos
│   └── ...
├── supabase/functions/server/
│   ├── index.tsx                      # Servidor principal
│   ├── routes-v2.tsx                  # Rotas API principais
│   ├── middleware.ts                  # Middleware (auth, rate limit)
│   └── ...
└── App.tsx                            # Aplicação principal
```

### 2.2 Fluxo de Dados

```
User Action (Admin Panel)
    ↓
Custom Hook (e.g., useProducts)
    ↓
API Call (fetch com JWT token)
    ↓
Supabase Edge Function
    ↓
Middleware (Auth, Validation, Rate Limit)
    ↓
Business Logic
    ↓
Database Query (PostgreSQL)
    ↓
Response JSON
    ↓
Update UI State
    ↓
Show Feedback (Toast notification)
```

---

## 3. Autenticação e Segurança

### 3.1 Sistema de Autenticação

**Provider:** Supabase Auth  
**Método:** JWT (JSON Web Tokens)  
**Tipos de Login:**
- Email/Password (padrão)
- Google OAuth
- Outros providers (configuráveis)

### 3.2 Proteção de Rotas

#### Frontend

```typescript
// App.tsx
{currentPage === 'admin' && (
  <>
    {isAuthenticated && isAdmin() ? (
      <UnifiedAdminPanel 
        onBack={() => navigateTo('home')} 
        onLogout={handleLogout}
      />
    ) : (
      <div>Acesso Negado</div>
    )}
  </>
)}
```

#### Backend (Middleware)

```typescript
// middleware.ts
export const requireAuth = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.split(' ')[1];
  
  // Validar token com Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  // Verificar se é admin
  if (user.app_metadata?.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  c.set('user', user);
  await next();
};
```

---

## 4. Módulos do Painel

### 4.1 Dashboard (AdminDashboard)

**Arquivo:** `/components/admin/AdminDashboard.tsx`  
**Rota:** Tab "dashboard"

#### Funcionalidades

✅ **Métricas em Tempo Real:**
- Total de produtos no catálogo
- Total de pedidos (com filtro por período)
- Total de clientes cadastrados
- Receita total (em Kwanzas e USD)
- Produtos em baixo estoque (alerta < 10 unidades)
- Taxa de conversão
- Ticket médio

✅ **Gráficos e Visualizações:**
- Vendas por período (últimos 7/30/90 dias)
- Produtos mais vendidos (top 10)
- Categorias mais populares
- Status de pedidos (pizza chart)
- Evolução de clientes novos

✅ **Alertas e Notificações:**
- Produtos com estoque baixo
- Pedidos pendentes de processamento
- Reviews aguardando moderação
- Flash sales expirando

### 4.2 Gestão de Produtos (ProductForm)

**Arquivo:** `/components/admin/ProductForm.tsx`  
**Rota:** Tab "products"  
**API:** `/make-server-d8a4dffd/products`

#### Funcionalidades

✅ **CRUD Completo:**
- ➕ Criar novo produto
- ✏️ Editar produto existente
- 🗑️ Deletar produto
- 📋 Listar produtos com filtros

✅ **Campos do Produto:**
- **Básicos:** Nome, Descrição, Categoria, Subcategoria, Marca
- **Preços:** Preço AOA, Preço USD, Preço Desconto
- **Estoque:** Quantidade disponível, SKU, Código de barras
- **Especificações Técnicas:** JSON flexível para specs detalhadas
- **Imagens:** Upload múltiplo (até 5 imagens)
- **SEO:** Meta title, Meta description, Slug
- **Flags:** Ativo, Destaque, Novidade, Em promoção

### 4.3 Gestão de Pedidos (OrderManagement)

**Arquivo:** `/components/admin/OrderManagement.tsx`  
**Rota:** Tab "orders"  
**API:** `/make-server-d8a4dffd/orders`

#### Funcionalidades

✅ **Visualização de Pedidos:**
- Lista completa de todos os pedidos
- Filtros por status, data, cliente
- Busca por número do pedido
- Ordenação por data, valor, status

✅ **Gestão de Status:**
- **pending** - Pendente (aguardando pagamento)
- **confirmed** - Confirmado (pagamento aprovado)
- **processing** - Em processamento
- **shipped** - Enviado/Em trânsito
- **delivered** - Entregue
- **cancelled** - Cancelado
- **refunded** - Reembolsado

### 4.4 Cupons de Desconto (CouponsManager)

**Arquivo:** `/components/admin/CouponsManager.tsx`  
**Rota:** Tab "coupons"  
**API:** `/make-server-d8a4dffd/coupons`

#### Funcionalidades

✅ **Tipos de Cupons:**
- **Percentual** - Ex: 15% OFF
- **Valor Fixo** - Ex: -5.000 Kz
- **Frete Grátis** - Remove taxa de entrega
- **Combo** - Percentual + Frete Grátis

### 4.5 Flash Sales (FlashSalesManager)

**Arquivo:** `/components/admin/FlashSalesManager.tsx`  
**Rota:** Tab "flash-sales"  
**API:** `/make-server-d8a4dffd/flash-sales`

#### Funcionalidades

✅ **Promoções Relâmpago:**
- Descontos temporários em produtos específicos
- Contador regressivo visual
- Estoque limitado para a promoção
- Desconto percentual ou fixo
- Agendamento de início e fim

---

## 5. API Backend

### 5.1 Estrutura do Servidor

**Arquivo Principal:** `/supabase/functions/server/index.tsx`  
**Framework:** Hono (Deno)  
**URL Base:** `https://{projectId}.supabase.co/functions/v1/make-server-d8a4dffd`

### 5.2 Rotas Disponíveis

| Rota | Métodos | Descrição |
|------|---------|-----------|
| `/health` | GET | Health check do servidor |
| `/products` | GET, POST, PUT, DELETE | Gestão de produtos |
| `/orders` | GET, POST, PATCH | Gestão de pedidos |
| `/customers` | GET, PATCH | Gestão de clientes |
| `/coupons` | GET, POST, PUT, DELETE | Gestão de cupons |
| `/flash-sales` | GET, POST, PUT, DELETE | Flash sales |
| `/ads` | GET, POST, PUT, DELETE | Gestão de anúncios |
| `/team` | GET, POST, PATCH, DELETE | Gestão de equipe |

---

## 6. Banco de Dados

### 6.1 Estrutura de Tabelas

**Total de Tabelas:** 25+

#### Tabelas Principais

**1. products**
- id, nome, descricao, categoria, marca
- preco_aoa, preco_usd, estoque
- especificacoes (JSONB)
- imagens (TEXT[])
- ativo, destaque, novidade

**2. orders**
- id, numero_pedido, user_id, status
- items (JSONB), total
- metodo_pagamento, endereco_entrega
- historico (JSONB)

**3. customer_profiles**
- id, nome, email, telefone
- role, total_pedidos, total_gasto
- pontos_fidelidade, nivel_vip

---

## 7. Fluxos de Trabalho

### 7.1 Fluxo de Login Admin

```
1. Admin acessa #admin
2. Se não autenticado, redireciona para #login
3. Admin envia email + password
4. Frontend chama useAuth.login()
5. Supabase valida credenciais
6. Se válido, retorna { user, session }
7. useAuth verifica se é admin
8. Armazena token e redireciona para #admin
```

### 7.2 Fluxo de Criação de Produto

```
1. Admin clica "Novo Produto"
2. ProductForm é exibido
3. Admin preenche formulário
4. Upload de imagens (se houver)
5. POST /products com token
6. Backend valida e cria produto
7. Frontend atualiza lista
8. Exibe toast de sucesso
```

---

## 8. Integrações Externas

### 8.1 Google Gemini AI (Chatbot)

**Variável de Ambiente:** `GEMINI_API_KEY`  
**Uso:** Assistente virtual para atendimento ao cliente

### 8.2 Resend (Email)

**Variável de Ambiente:** `RESEND_API_KEY`  
**Uso:** Envio de emails transacionais (confirmação de pedido, notificações)

### 8.3 Multicaixa Express (Pagamentos)

**Integração:** API de pagamentos para Angola  
**Uso:** Processamento de pagamentos online

---

## Conclusão

Este documento fornece uma visão técnica completa do Painel Administrativo KZSTORE. Para mais detalhes sobre implementação específica de cada módulo, consulte os arquivos de código-fonte correspondentes.

**Contato Técnico:** geral@kzstore.com  
**Suporte:** +244 931 054 015
