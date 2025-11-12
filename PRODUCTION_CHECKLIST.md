# 📋 Checklist para Produção - KZSTORE

## ❌ CRÍTICO - Bloqueadores para Produção

### 1. ⚠️ Variáveis de Ambiente (.env)
**Status**: ❌ NÃO EXISTE
- [ ] Criar arquivo `.env` na raiz do projeto
- [ ] Configurar variáveis Supabase:
  ```env
  VITE_SUPABASE_URL=sua_url_aqui
  VITE_SUPABASE_ANON_KEY=sua_chave_publica_aqui
  ```
- [ ] Criar `.env.example` para documentação
- [ ] Adicionar `.env` no `.gitignore`

**AÇÃO**: O projeto atualmente usa URLs hardcoded. DEVE migrar para variáveis de ambiente.

---

### 2. 🗃️ Migrações do Banco de Dados
**Status**: ⚠️ PARCIALMENTE ORGANIZADO
- [ ] Consolidar todas as migrações em ordem sequencial
- [ ] Testar migrações em ambiente limpo
- [ ] Documentar dependências entre migrations
- [ ] Aplicar todas as migrações no Supabase de produção

**Migrações existentes**: 23 arquivos
- ✅ Sistemas principais criados (trade-in, B2B, quotes, etc.)
- ✅ Correções RLS aplicadas (6 migrations de fix)
- ⚠️ Algumas migrations sem prefixo de data organizado

**AÇÃO**: Executar `supabase db push` após revisar todas as migrations.

---

### 3. 🔒 Row Level Security (RLS)
**Status**: ✅ PARCIALMENTE IMPLEMENTADO
- [x] RLS em `trade_in_requests` 
- [x] RLS em `trade_in_credits`
- [x] RLS em `business_accounts`
- [ ] **Revisar RLS em TODAS as tabelas sensíveis**
- [ ] Testar permissões de admin vs usuário comum
- [ ] Verificar políticas de INSERT/UPDATE/DELETE

**AÇÃO**: Fazer auditoria completa de todas as 30+ tabelas.

---

### 4. 🧹 Limpeza de Console.logs
**Status**: ❌ MUITOS LOGS EM PRODUÇÃO
- **Encontrados**: 100+ `console.log()` no código
- [ ] Remover ou envolver em `if (import.meta.env.DEV)`
- [ ] Substituir por sistema de logging adequado
- [ ] Manter apenas logs de erro críticos

**Arquivos com mais logs**:
- `MyOrdersPage.tsx` - logs de debug do filtro
- `TradeInForm.tsx` - logs de upload
- `BusinessRegistration.tsx` - logs de validação
- `B2BManager.tsx` - logs de admin
- `PriceAlertButton.tsx` - muitos logs
- Todos os `admin/*` components

**AÇÃO**: Criar tarefa para remover logs antes do deploy.

---

### 5. 📦 Build de Produção
**Status**: ⚠️ NÃO TESTADO
- [ ] Rodar `npm run build` sem erros
- [ ] Testar build localmente
- [ ] Verificar tamanho dos bundles
- [ ] Otimizar imports pesados
- [ ] Configurar code splitting

**AÇÃO**: Executar build e corrigir erros de TypeScript/imports.

---

### 6. 🔐 Segurança API
**Status**: ⚠️ EXPOSTO
- [ ] **CRÍTICO**: URL do projeto Supabase está hardcoded em 3+ arquivos
  - `AdminPanel.tsx`: `https://${projectId}.supabase.co`
  - `useKZStore.ts`: `https://${projectId}.supabase.co`
- [ ] Migrar para variáveis de ambiente
- [ ] Proteger service role key (apenas backend)
- [ ] Configurar CORS adequadamente

**AÇÃO**: URGENTE - Remover URLs hardcoded.

---

### 7. 📧 Serviço de Email
**Status**: ⚠️ CONFIGURAÇÃO PENDENTE
- [ ] Configurar **Resend API Key** (`RESEND_API_KEY`)
- [ ] Testar envio de emails:
  - Confirmação de pedido
  - Alertas de preço
  - Notificações de trade-in
  - Aprovação B2B
- [ ] Configurar domínio verificado no Resend
- [ ] Templates de email profissionais

**Arquivos afetados**:
- `email-service.tsx` - já tem integração Resend
- Apenas falta configurar a chave

---

### 8. 🤖 Chatbot AI (Opcional)
**Status**: ⏸️ OPCIONAL
- [ ] Configurar **Gemini API Key** (`GEMINI_API_KEY`)
- [ ] Testar chatbot de atendimento
- [ ] OU remover referências ao chatbot se não for usar

**Arquivos afetados**:
- `server/index.tsx` e `index-new.tsx`

---

## ⚠️ IMPORTANTE - Melhorias Recomendadas

### 9. 🎨 Design System
**Status**: ✅ CORRIGIDO (tema light aplicado)
- [x] Todos os componentes usando tema claro
- [x] Moeda em Kwanzas (Kz)
- [x] Localização Angola (províncias, NIF, telefone)
- [ ] Revisar responsividade mobile
- [ ] Testar em diferentes navegadores

---

### 10. 📱 PWA (Progressive Web App)
**Status**: ✅ IMPLEMENTADO
- [x] Service Worker configurado (`pwa.ts`)
- [x] Notificações push
- [x] Instalação como app
- [ ] Testar instalação em mobile
- [ ] Configurar ícones e splash screens
- [ ] Criar `manifest.json` adequado

---

### 11. 🧪 Testes
**Status**: ❌ SEM TESTES
- [ ] Testar fluxo completo de compra
- [ ] Testar trade-in: envio → avaliação → crédito
- [ ] Testar cadastro B2B → aprovação → desconto
- [ ] Testar alertas de preço
- [ ] Testar painel admin completo

---

### 12. 📊 Analytics
**Status**: ⚠️ TABELAS CRIADAS, SEM USO
- Tabela `analytics_events` existe
- [ ] Implementar tracking de eventos
- [ ] Configurar Google Analytics / Plausible
- [ ] Métricas de conversão

---

### 13. 🗂️ Organização de Arquivos
**Status**: ⚠️ DUPLICATAS ENCONTRADAS
- Pasta `KZSTORE Online Shop (4)` com arquivos duplicados
- [ ] Remover pastas de backup
- [ ] Limpar arquivos não utilizados
- [ ] Documentar estrutura do projeto

---

### 14. 📖 Documentação
**Status**: ❌ README GENÉRICO
- [ ] Atualizar README.md com:
  - Descrição do projeto
  - Instruções de instalação
  - Configuração de ambiente
  - Scripts disponíveis
  - Estrutura do banco de dados
  - Guia de deploy
- [ ] Criar documentação para admins
- [ ] Documentar APIs e Edge Functions

---

## 🚀 DEPLOY

### 15. Hospedagem Frontend
**Opções**:
- [ ] **Vercel** (recomendado para React)
- [ ] **Netlify**
- [ ] **Cloudflare Pages**
- [ ] **GitHub Pages**

**Configuração necessária**:
- [ ] Criar `vercel.json` ou `netlify.toml`
- [ ] Configurar variáveis de ambiente na plataforma
- [ ] Configurar domínio customizado

---

### 16. Configuração Supabase
**Status**: ⚠️ DESENVOLVIMENTO
- [ ] Criar projeto de produção no Supabase
- [ ] Aplicar todas as migrações
- [ ] Configurar políticas RLS
- [ ] Configurar Storage buckets
- [ ] Fazer deploy das Edge Functions
- [ ] Configurar domínio customizado (opcional)

---

### 17. Domínio e SSL
**Status**: ⏸️ PENDENTE
- [ ] Registrar domínio (.ao para Angola)
- [ ] Configurar DNS
- [ ] SSL automático (via plataforma de hosting)

---

## 📝 RESUMO EXECUTIVO

### ⛔ BLOQUEADORES CRÍTICOS (DEVE RESOLVER):
1. ❌ **Criar arquivo `.env`** com credenciais Supabase
2. ❌ **Remover 100+ console.logs** de produção
3. ❌ **Testar `npm run build`** e corrigir erros
4. ❌ **Migrar URLs hardcoded** para variáveis de ambiente
5. ❌ **Aplicar migrações** no Supabase de produção
6. ❌ **Configurar Resend** para envio de emails

### ⚠️ IMPORTANTES (RECOMENDADO):
7. ⚠️ Fazer auditoria completa de RLS
8. ⚠️ Testar toda a aplicação (E2E)
9. ⚠️ Limpar arquivos duplicados
10. ⚠️ Atualizar documentação

### ✅ FUNCIONANDO:
- ✅ Todas as funcionalidades principais implementadas
- ✅ Design system padronizado (light theme)
- ✅ Localização para Angola (Kz, províncias, NIF, +244)
- ✅ Trade-in completo (form, avaliação, créditos)
- ✅ B2B (cadastro, aprovação, descontos)
- ✅ Pedidos funcionando corretamente
- ✅ PWA configurado

---

## 🎯 PRÓXIMOS PASSOS SUGERIDOS

### Fase 1 - Setup Básico (1-2 horas)
1. Criar `.env` e `.env.example`
2. Substituir URLs hardcoded por variáveis
3. Configurar projeto Supabase de produção
4. Aplicar todas as migrações

### Fase 2 - Limpeza (2-3 horas)
5. Remover todos os console.logs
6. Limpar pastas duplicadas
7. Testar build de produção
8. Corrigir erros do build

### Fase 3 - Testes (3-4 horas)
9. Testar todos os fluxos principais
10. Verificar RLS policies
11. Testar permissões admin vs usuário
12. Testar em mobile

### Fase 4 - Deploy (1-2 horas)
13. Fazer deploy no Vercel/Netlify
14. Configurar variáveis de ambiente
15. Testar em produção
16. Configurar domínio

### Fase 5 - Pós-Deploy (opcional)
17. Configurar Resend para emails
18. Configurar Analytics
19. Documentação completa
20. Monitoring e logs

---

**Tempo estimado total**: 10-15 horas de trabalho focado
**Prioridade máxima**: Itens 1-6 (bloqueadores críticos)
