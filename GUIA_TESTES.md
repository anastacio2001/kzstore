# 🧪 GUIA DE TESTES - KZSTORE

**Data:** 27 de Novembro de 2024
**Objetivo:** Testar fluxo completo da loja

---

## ✅ PASSO 1: JWT_SECRET CONFIGURADO

✅ **JWT_SECRET forte gerado e configurado**
- Chave de 128 caracteres hexadecimais
- Configurado em `.env`
- Backend reiniciado

---

## 👤 CREDENCIAIS DE TESTE CRIADAS

### **Cliente Normal:**
```
📧 Email: teste@kzstore.com
🔑 Senha: senha123
```

### **Administrador:**
```
📧 Email: admin@kzstore.com
🔑 Senha: kzstore2024
🔗 URL Admin: http://localhost:3000/#admin
```

---

## 🧪 TESTE 1: LOGIN DE CLIENTE

### **Passos:**
1. Acesse: http://localhost:3000/
2. Clique no botão **"Entrar"** (canto superior direito)
3. Escolha aba **"Login"**
4. Digite:
   - Email: `teste@kzstore.com`
   - Senha: `senha123`
5. Clique em **"Entrar"**

### **Resultado Esperado:**
✅ Login bem-sucedido
✅ Ver nome do usuário no header
✅ Dropdown com opções: Meus Pedidos, Minha Conta, etc.
✅ Botão "Sair" disponível

### **Se der erro:**
- Verifique se o backend está rodando
- Abra console do navegador (F12)
- Verifique erros na aba Network

---

## 🧪 TESTE 2: NAVEGAÇÃO NO SITE (LOGADO)

### **Passos:**
1. Após login, clique em **"Produtos"**
2. Veja o catálogo de produtos
3. Clique em um produto
4. Veja detalhes do produto

### **Resultado Esperado:**
✅ Catálogo mostra 45 produtos
✅ Produtos têm imagens, preços e descrições
✅ Detalhes do produto carregam corretamente
✅ Botão "Adicionar ao Carrinho" visível

---

## 🧪 TESTE 3: ADICIONAR AO CARRINHO

### **Passos:**
1. Na página de produto, clique **"Adicionar ao Carrinho"**
2. Veja notificação de sucesso
3. Clique no ícone do carrinho (canto superior direito)

### **Resultado Esperado:**
✅ Toast verde: "Produto adicionado ao carrinho"
✅ Contador do carrinho aumenta (badge vermelho)
✅ Carrinho mostra o produto adicionado
✅ Preço total calculado corretamente

---

## 🧪 TESTE 4: CHECKOUT COMPLETO

### **Passos:**

**4.1 - Ir para Checkout**
1. No carrinho, clique **"Finalizar Compra"**
2. Preencha o formulário:
   ```
   Nome: Teste Cliente
   Email: teste@kzstore.com
   Telefone: +244931054015
   Província: Luanda
   Município: Viana
   Bairro: Zango
   Rua: Rua Teste, 123
   ```

**4.2 - Escolher Pagamento**
3. Método de pagamento: **Transferência Bancária**
4. Clique **"Confirmar Pedido"**

### **Resultado Esperado:**
✅ Pedido criado com sucesso
✅ Número de pedido gerado (ex: #ORD-2024-001)
✅ Redirecionado para página de confirmação
✅ Instruções de transferência bancária exibidas
✅ **IMPORTANTE:** Verificar se pedido foi salvo no banco

---

## 🧪 TESTE 5: VER PEDIDOS (MEUS PEDIDOS)

### **Passos:**
1. Clique no seu nome (canto superior direito)
2. Selecione **"Meus Pedidos"**
3. Veja a lista de pedidos

### **Resultado Esperado:**
✅ Pedido recém-criado aparece na lista
✅ Status: "Pendente" ou "Aguardando Pagamento"
✅ Total correto
✅ Itens do pedido visíveis
✅ Botão "Ver Detalhes" funciona

---

## 🧪 TESTE 6: LOGIN COMO ADMIN

### **Passos:**
1. Clique em **"Sair"** (logout do cliente)
2. Acesse: http://localhost:3000/#admin
3. Digite:
   - Email: `admin@kzstore.com`
   - Senha: `kzstore2024`
4. Clique **"Entrar"**

### **Resultado Esperado:**
✅ Login como admin bem-sucedido
✅ Painel admin abre
✅ Dashboard com estatísticas
✅ Menu lateral com todas as opções

---

## 🧪 TESTE 7: PAINEL ADMIN - VER PEDIDOS

### **Passos:**
1. No painel admin, clique **"Gestão de Pedidos"**
2. Veja a lista de todos os pedidos
3. Encontre o pedido de teste criado

### **Resultado Esperado:**
✅ Todos os pedidos listados (incluindo o de teste)
✅ Filtros funcionam (por status, data, etc.)
✅ Pedido de teste visível com dados corretos
✅ Opções de ação disponíveis

---

## 🧪 TESTE 8: ATUALIZAR STATUS DO PEDIDO

### **Passos:**
1. No pedido de teste, clique **"Editar"** ou ícone de lápis
2. Altere status para: **"Pagamento Confirmado"**
3. (Opcional) Adicione um comentário
4. Clique **"Salvar"**

### **Resultado Esperado:**
✅ Status atualizado com sucesso
✅ Toast de confirmação
✅ Status refletido na lista de pedidos
✅ **Futuro:** Email/WhatsApp enviado ao cliente (quando configurado)

---

## 🧪 TESTE 9: GESTÃO DE PRODUTOS (ADMIN)

### **Passos:**
1. No painel admin, clique **"Gestão de Produtos"**
2. Veja catálogo de produtos
3. Clique **"Adicionar Produto"**
4. Preencha formulário:
   ```
   Nome: Produto Teste
   Categoria: Software
   Preço: 50000
   Estoque: 10
   Descrição: Produto de teste
   ```
5. Clique **"Salvar"**

### **Resultado Esperado:**
✅ Produto criado
✅ Aparece na lista de produtos
✅ Contagem de produtos aumenta
✅ Produto visível no catálogo do site

---

## 🧪 TESTE 10: CHATBOT IA

### **Passos:**
1. Logout do admin
2. Volte para página principal: http://localhost:3000/
3. Clique no **botão roxo/azul** (canto inferior direito)
4. Digite: **"Quero uma memória RAM DDR4"**
5. Aguarde resposta

### **Resultado Esperado:**
✅ Chatbot abre
✅ Mensagem de boas-vindas exibida
✅ IA responde com produtos relevantes
✅ Preços e disponibilidade corretos
✅ Sugestões de produtos aparecem

---

## 🧪 TESTE 11: RESPONSIVIDADE MOBILE

### **Passos:**
1. Abra no celular: http://192.168.1.9:3000/
   (ou use DevTools → Toggle Device Toolbar)
2. Navegue pelo site
3. Teste menu mobile
4. Adicione produto ao carrinho
5. Faça checkout

### **Resultado Esperado:**
✅ Layout responsivo
✅ Menu hamburguer funciona
✅ Botões acessíveis
✅ Checkout mobile funcional
✅ Imagens redimensionadas

---

## 🧪 TESTE 12: WHATSAPP INTEGRATION

### **Passos:**
1. Clique no **botão verde do WhatsApp** (canto inferior direito)
2. Ou abra o chatbot IA e clique no botão WhatsApp

### **Resultado Esperado:**
✅ Abre conversa WhatsApp
✅ Número correto: +244 931 054 015
✅ Mensagem pré-preenchida (se configurado)

---

## 🧪 TESTE 13: CUPOM DE DESCONTO

### **Passos:**
1. Como admin, crie um cupom:
   - Código: `TESTE10`
   - Tipo: Porcentagem
   - Valor: 10%
   - Ativo: Sim
2. Logout do admin
3. Como cliente, adicione produtos ao carrinho
4. No checkout, insira cupom: `TESTE10`
5. Clique "Aplicar"

### **Resultado Esperado:**
✅ Cupom aplicado
✅ Desconto de 10% calculado
✅ Total atualizado
✅ Mensagem de sucesso

---

## 🧪 TESTE 14: FLASH SALE

### **Passos:**
1. Verifique se há flash sale ativa
2. Veja produto em flash sale na homepage
3. Clique no produto
4. Verifique preço com desconto
5. Adicione ao carrinho

### **Resultado Esperado:**
✅ Banner de flash sale visível
✅ Cronômetro contando
✅ Preço original riscado
✅ Preço de desconto destacado
✅ Porcentagem de desconto exibida

---

## 🧪 TESTE 15: LOGOUT E PERSISTÊNCIA

### **Passos:**
1. Faça login como cliente
2. Adicione produtos ao carrinho
3. **NÃO faça logout** - apenas atualize a página (F5)

### **Resultado Esperado:**
✅ Usuário continua logado (sessão persiste)
✅ Carrinho mantém produtos
✅ Nome do usuário ainda visível

---

## ✅ CHECKLIST DE TESTES

### **Funcionalidades Essenciais:**
- [ ] Login de cliente funciona
- [ ] Login de admin funciona
- [ ] Adicionar produto ao carrinho
- [ ] Checkout completo
- [ ] Pedido salvo no banco
- [ ] "Meus Pedidos" mostra pedidos
- [ ] Admin vê todos os pedidos
- [ ] Admin pode atualizar status
- [ ] Admin pode criar produtos
- [ ] Chatbot IA responde

### **Integrações:**
- [ ] WhatsApp link funciona
- [ ] Gemini AI funciona
- [ ] Banco de dados conectado

### **UX/UI:**
- [ ] Layout responsivo
- [ ] Mobile funcional
- [ ] Botões clicáveis
- [ ] Imagens carregam
- [ ] Toasts aparecem

### **Segurança:**
- [ ] JWT_SECRET configurado
- [ ] Senhas com hash (bcrypt)
- [ ] Rotas admin protegidas
- [ ] Logout funciona

---

## ❌ PROBLEMAS CONHECIDOS

### **Se encontrar erro:**

**"Email ou senha inválidos"**
```
Solução: Verifique se usou as credenciais corretas:
- teste@kzstore.com / senha123 (cliente)
-- admin@kzstore.com / kzstore2024 (admin)
```

**"Não autenticado" ao carregar produtos**
```
Solução: Isso é esperado se não estiver logado.
Apenas faça login e recarregue.
```

**Produtos não carregam**
```
Solução:
1. Verifique se backend está rodando (localhost:3001)
2. Abra http://localhost:3001/api/products
3. Deve retornar JSON com produtos
```

**Carrinho vazio após reload**
```
Solução: Isso é esperado - carrinho usa localStorage.
Adicione produtos novamente após login.
```

---

## 📊 RELATÓRIO DE TESTES

Após completar todos os testes, preencha:

| Teste | Status | Observações |
|-------|--------|-------------|
| 1. Login Cliente | ⬜ | |
| 2. Navegação | ⬜ | |
| 3. Carrinho | ⬜ | |
| 4. Checkout | ⬜ | |
| 5. Meus Pedidos | ⬜ | |
| 6. Login Admin | ⬜ | |
| 7. Ver Pedidos Admin | ⬜ | |
| 8. Atualizar Status | ⬜ | |
| 9. Criar Produto | ⬜ | |
| 10. Chatbot IA | ⬜ | |
| 11. Mobile | ⬜ | |
| 12. WhatsApp | ⬜ | |
| 13. Cupom | ⬜ | |
| 14. Flash Sale | ⬜ | |
| 15. Persistência | ⬜ | |

**Legenda:** ✅ Passou | ❌ Falhou | ⚠️ Com problemas

---

## 🎯 PRÓXIMOS PASSOS APÓS TESTES

Se todos os testes passaram:
1. ✅ Sistema está funcional!
2. ⚠️ Configurar email (Resend)
3. ⚠️ Configurar WhatsApp Business
4. ⚠️ Solicitar Multicaixa Express
5. 🚀 Preparar para deploy!

---

**Bons testes!** 🧪
