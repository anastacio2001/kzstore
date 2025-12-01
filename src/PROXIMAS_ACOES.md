# 🎯 PRÓXIMAS AÇÕES - KZSTORE

**Data:** 19/11/2025  
**Última Atualização:** Implementação dos serviços críticos concluída

---

## ✅ O QUE FOI FEITO HOJE

### Serviços Criados (100% Completos):
1. ✅ **ordersService.ts** - Sistema completo de pedidos (548 linhas)
2. ✅ **couponsService.ts** - Sistema de cupons (344 linhas)
3. ✅ **teamService.ts** - Sistema de equipe (299 linhas)

### Componentes Atualizados:
4. ✅ **CheckoutPage.tsx** - Agora usa ordersService com validação de estoque
5. ✅ **CouponInput.tsx** - Agora usa couponsService diretamente

### Total Implementado Hoje:
- **1.191 linhas** de código
- **40 funções** criadas
- **8 interfaces** definidas
- **2 componentes** atualizados

---

## 🔴 AÇÕES CRÍTICAS (Fazer AGORA)

### 1. Criar Tabelas no Banco de Dados
**Prioridade:** 🔴 CRÍTICA  
**Tempo estimado:** 30 minutos

Você precisa criar as seguintes tabelas no Supabase para que os serviços funcionem:

#### a) Tabela `orders`
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_type VARCHAR(50),
  discount_details TEXT,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  shipping_address JSONB NOT NULL,
  notes TEXT,
  tracking_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);
```

#### b) Tabela `coupons`
```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) NOT NULL,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  user_limit INTEGER,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  applicable_to VARCHAR(20) DEFAULT 'all',
  applicable_ids JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(active);
CREATE INDEX idx_coupons_valid_dates ON coupons(valid_from, valid_until);
```

#### c) Tabela `coupon_usage`
```sql
CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX idx_coupon_usage_order_id ON coupon_usage(order_id);
```

#### d) Tabela `team_members`
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  role VARCHAR(50) NOT NULL,
  department VARCHAR(100) NOT NULL,
  avatar TEXT,
  bio TEXT,
  permissions JSONB DEFAULT '[]'::JSONB,
  active BOOLEAN DEFAULT TRUE,
  hire_date DATE NOT NULL,
  salary DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_active ON team_members(active);
```

**Como fazer:**
1. Abra o Supabase Dashboard: https://supabase.com/dashboard
2. Vá em "SQL Editor"
3. Cole e execute cada script acima (um de cada vez)
4. Verifique se as tabelas foram criadas em "Table Editor"

---

### 2. Testar Fluxo Completo de Compra
**Prioridade:** 🔴 CRÍTICA  
**Tempo estimado:** 20 minutos

Depois de criar as tabelas, teste o seguinte fluxo:

#### Passo a Passo:
1. ✅ Fazer login na aplicação
2. ✅ Adicionar produtos ao carrinho
3. ✅ (Opcional) Aplicar cupom de desconto
4. ✅ Ir para checkout
5. ✅ Preencher informações de entrega
6. ✅ Selecionar método de pagamento
7. ✅ Confirmar pedido
8. ✅ Verificar se:
   - Pedido foi criado no banco de dados
   - Estoque foi descontado automaticamente
   - Número do pedido foi gerado corretamente
   - Cupom foi aplicado (se usado)
   - Página de confirmação apareceu

#### Possíveis Erros:
- ❌ "Tabela 'orders' não encontrada" → Criar tabelas (Ação #1)
- ❌ "Estoque insuficiente" → Aumentar estoque dos produtos
- ❌ "Usuário não autenticado" → Fazer login primeiro
- ❌ "Cupom inválido" → Criar cupons de teste (ver Ação #3)

---

### 3. Criar Cupons de Teste
**Prioridade:** 🟡 ALTA  
**Tempo estimado:** 10 minutos

Para testar o sistema de cupons, crie alguns cupons de teste:

```sql
-- Cupom de 10% de desconto
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, valid_from, valid_until, active)
VALUES ('KZ10OFF', '10% de desconto em toda a loja', 'percentage', 10, 10000, NOW(), NOW() + INTERVAL '30 days', true);

-- Cupom de 5000 Kz de desconto
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, valid_from, valid_until, active)
VALUES ('KZ5000', '5000 Kz de desconto', 'fixed', 5000, 20000, NOW(), NOW() + INTERVAL '30 days', true);

-- Cupom de primeira compra (20% de desconto)
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, user_limit, valid_from, valid_until, active)
VALUES ('BEMVINDO', '20% de desconto na primeira compra', 'percentage', 20, 5000, 1, NOW(), NOW() + INTERVAL '90 days', true);

-- Cupom com limite de uso (100 usos)
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, usage_limit, valid_from, valid_until, active)
VALUES ('BLACKFRIDAY', '30% de desconto - Black Friday', 'percentage', 30, 15000, 100, NOW(), NOW() + INTERVAL '7 days', true);
```

---

## 🟡 AÇÕES DE ALTA PRIORIDADE (Próxima Semana)

### 4. Atualizar AdminPanel para Usar Novos Serviços
**Prioridade:** 🟡 ALTA  
**Tempo estimado:** 2 horas

#### O que fazer:
- [ ] Criar aba de **Gerenciamento de Pedidos** no AdminPanel
  - Usar `ordersService.getAllOrders()`
  - Mostrar tabela com pedidos
  - Filtros por status
  - Botões para atualizar status
  - Modal de detalhes do pedido

- [ ] Criar aba de **Gerenciamento de Cupons**
  - Usar `couponsService.getAllCoupons()`
  - Formulário para criar cupons
  - Botões para ativar/desativar
  - Estatísticas de uso

- [ ] Criar aba de **Gerenciamento de Equipe**
  - Usar `teamService.getAllTeamMembers()`
  - Formulário para adicionar membros
  - Sistema de permissões
  - Ativar/desativar membros

#### Componentes a Criar:
```
/components/admin/OrdersManager.tsx
/components/admin/CouponsManager.tsx
/components/admin/TeamManagerNew.tsx (substituir TeamManager.tsx antigo)
```

---

### 5. Integrar ImageUploader nos Formulários
**Prioridade:** 🟡 ALTA  
**Tempo estimado:** 1 hora

#### Formulários a Atualizar:
- [ ] **ProductForm.tsx** - Upload de imagens de produtos
- [ ] **AdsManager.tsx** - Upload de banners (múltiplas imagens)
- [ ] **HeroSectionManager.tsx** - Imagens de hero sections

#### Código de Exemplo:
```typescript
import { ImageUploader } from '../ui/ImageUploader';

// No formulário
const [imageUrls, setImageUrls] = useState<string[]>([]);

<ImageUploader
  maxFiles={5}
  onUploadComplete={(urls) => setImageUrls(urls)}
  folder="products" // ou "ads" ou "hero"
/>
```

---

### 6. Criar Página de "Meus Pedidos"
**Prioridade:** 🟡 ALTA  
**Tempo estimado:** 1.5 horas

#### Criar Componente:
```
/components/MyOrdersPage.tsx (atualizar o existente)
```

#### Funcionalidades:
- [ ] Listar pedidos do usuário usando `ordersService.getUserOrders(userId)`
- [ ] Mostrar status de cada pedido (pendente, processando, enviado, etc)
- [ ] Detalhes do pedido (itens, preços, endereço)
- [ ] Rastreamento do pedido (se disponível)
- [ ] Botão para "Cancelar Pedido" (se status = pending)
- [ ] Histórico de atualizações

---

### 7. Sistema de Notificações de Pedidos
**Prioridade:** 🟡 ALTA  
**Tempo estimado:** 2 horas

#### O que implementar:
- [ ] Email de confirmação ao criar pedido
- [ ] Email ao atualizar status (processando, enviado, entregue)
- [ ] WhatsApp notification (via API oficial)
- [ ] Notificações in-app (toast/alert)

#### Usar:
- Resend API (para emails)
- WhatsApp Business API
- Supabase Realtime (para notificações em tempo real)

---

## 🟢 AÇÕES DE MÉDIA PRIORIDADE (Próximo Mês)

### 8. Dashboard de Estatísticas de Pedidos
**Prioridade:** 🟢 MÉDIA  
**Tempo estimado:** 3 horas

#### Métricas a Mostrar:
- Total de pedidos (hoje, semana, mês)
- Receita total
- Ticket médio
- Taxa de conversão
- Produtos mais vendidos
- Gráficos de vendas (por dia, semana, mês)
- Status dos pedidos (gráfico de pizza)

#### Usar:
- `ordersService.getOrderStats()`
- `ordersService.getRecentOrders(days)`
- Biblioteca: `recharts` (para gráficos)

---

### 9. Filtros Avançados de Pedidos
**Prioridade:** 🟢 MÉDIA  
**Tempo estimado:** 2 horas

#### Filtros a Implementar:
- [ ] Por status (pending, processing, shipped, delivered, cancelled)
- [ ] Por método de pagamento
- [ ] Por faixa de data (hoje, semana, mês, customizado)
- [ ] Por valor (maior que, menor que)
- [ ] Por cliente (buscar por nome/email)
- [ ] Por produto (pedidos que contém produto X)

---

### 10. Exportação de Relatórios
**Prioridade:** 🟢 MÉDIA  
**Tempo estimado:** 2 horas

#### Formatos:
- [ ] **PDF** - Relatório de vendas
- [ ] **Excel/CSV** - Exportar pedidos
- [ ] **PDF** - Nota fiscal/invoice

#### Bibliotecas Sugeridas:
- `jspdf` - Gerar PDFs
- `xlsx` - Gerar Excel
- `csv-stringify` - Gerar CSV

---

### 11. Sistema de Avaliação de Pedidos
**Prioridade:** 🟢 MÉDIA  
**Tempo estimado:** 2 horas

#### Funcionalidades:
- [ ] Cliente pode avaliar pedido após entrega
- [ ] Rating de 1-5 estrelas
- [ ] Comentário opcional
- [ ] Admin pode ver avaliações de atendimento
- [ ] Métricas de satisfação

---

## ⚪ AÇÕES DE BAIXA PRIORIDADE (Futuro)

### 12. Rastreamento de Entregas
**Prioridade:** ⚪ BAIXA  
**Tempo estimado:** 4 horas

- [ ] Integração com correios/transportadoras
- [ ] Atualização automática de status
- [ ] Mapa de rastreamento
- [ ] Notificações de entrega

---

### 13. Integração com Gateway de Pagamento
**Prioridade:** ⚪ BAIXA (mas importante!)  
**Tempo estimado:** 8 horas

#### Gateways Sugeridos (Angola):
- Multicaixa Express API
- EMIS Gateway
- Outro gateway angolano

#### O que implementar:
- [ ] Pagamento online direto
- [ ] Confirmação automática de pagamento
- [ ] Webhook para atualizar status
- [ ] Reembolsos automáticos

---

### 14. App Mobile (React Native)
**Prioridade:** ⚪ BAIXA  
**Tempo estimado:** 40 horas

- [ ] Criar app React Native
- [ ] Compartilhar código com web
- [ ] Push notifications
- [ ] Publicar na Google Play Store / App Store

---

### 15. Chatbot AI com Gemini
**Prioridade:** ⚪ BAIXA  
**Tempo estimado:** 6 horas

- [ ] Integração com Google Gemini API
- [ ] Respostas automáticas
- [ ] Recomendações de produtos
- [ ] Suporte ao cliente 24/7

---

## 📋 CHECKLIST RÁPIDO

### Hoje (19/11/2025):
- [x] Criar ordersService.ts
- [x] Criar couponsService.ts
- [x] Criar teamService.ts
- [x] Atualizar CheckoutPage.tsx
- [x] Atualizar CouponInput.tsx
- [x] Criar documentação (SERVICOS_IMPLEMENTADOS.md)

### Amanhã (20/11/2025):
- [ ] Criar tabelas no banco de dados
- [ ] Testar fluxo completo de compra
- [ ] Criar cupons de teste
- [ ] Corrigir erros encontrados

### Esta Semana (21-25/11/2025):
- [ ] Atualizar AdminPanel
- [ ] Integrar ImageUploader
- [ ] Criar página "Meus Pedidos"
- [ ] Sistema de notificações

### Próximo Mês (Dezembro 2025):
- [ ] Dashboard de estatísticas
- [ ] Filtros avançados
- [ ] Exportação de relatórios
- [ ] Sistema de avaliações

---

## 💡 DICAS IMPORTANTES

### 1. Testes são Essenciais
Antes de lançar em produção, teste TUDO:
- ✅ Criar pedido com sucesso
- ✅ Validação de estoque funciona
- ✅ Cupons são aplicados corretamente
- ✅ Estoque é descontado automaticamente
- ✅ Cancelamento reverte estoque
- ✅ Emails/notificações são enviados

### 2. Backup Regular
- Configure backup automático do banco de dados
- Faça backup manual antes de mudanças grandes
- Mantenha versões antigas do código (Git)

### 3. Monitoramento
- Configure alertas para erros (Sentry/LogRocket)
- Monitor uso de créditos Firebase/Supabase
- Acompanhe métricas de vendas

### 4. Documentação
- Documente mudanças importantes
- Mantenha README atualizado
- Crie guias para novos desenvolvedores

### 5. Segurança
- Valide SEMPRE inputs do usuário
- Use prepared statements (SQL injection)
- Permissões corretas no banco de dados
- Rate limiting para APIs

---

## 📞 SUPORTE

### Se encontrar problemas:

**Erro de Banco de Dados:**
1. Verifique se tabelas foram criadas
2. Verifique permissões (RLS policies)
3. Verifique conexão Supabase

**Erro de Checkout:**
1. Console do navegador (F12)
2. Verificar user.id existe
3. Verificar produtos têm estoque
4. Verificar validação de formulário

**Erro de Cupom:**
1. Verificar cupom ativo
2. Verificar datas de validade
3. Verificar valor mínimo de compra
4. Verificar limite de uso

---

## 🎉 PARABÉNS!

Você acabou de implementar **3 serviços críticos** e está muito perto de ter um e-commerce 100% funcional!

**Próximo Milestone:** Testar fluxo completo de vendas ✅

---

**Desenvolvido para KZSTORE** 🇦🇴  
**Última atualização:** 19/11/2025
