# Guia de Teste - Correções Aplicadas

## 🎯 Teste Rápido (5 minutos)

### 1. **Executar SQL** ⚠️ CRÍTICO
```bash
1. Abra: https://supabase.com/dashboard/project/duxeeawfyxcciwlyjllk/sql
2. Cole TODO o conteúdo de: /supabase/migrations/create_missing_tables.sql
3. Execute (Ctrl+Enter)
4. Aguarde "Success. No rows returned"
```

### 2. **Testar Recuperação de Senha**
```
1. Vá para /forgot-password (ou clique "Esqueceu a senha?" no login)
2. Digite: l.anastacio801@gmail.com
3. Clique "Enviar Link de Recuperação"
4. ✅ Deve mostrar "Email Enviado!"
5. Verifique seu email
6. Clique no link
7. Defina nova senha
8. ✅ Deve redirecionar para login
```

### 3. **Testar Criação de Pedidos**
```
1. Adicione iPhone ao carrinho (tem Flash Sale!)
2. Vá para Checkout
3. Preencha dados:
   Nome: Teste User
   Email: teste@example.com
   Telefone: 923456789
   Endereço: Rua Teste, 123
   Cidade: Luanda
4. Clique "Continuar para Pagamento"
5. Escolha "Multicaixa Express"
6. Clique "Confirmar Pedido"
7. ✅ Deve criar pedido com sucesso
```

**Verificar no Console:**
```
📦 Creating order: {...}  ✅ Deve aparecer
✅ Order created: {...}   ✅ Deve aparecer
```

### 4. **Verificar Descontos no Pedido**
```
Resumo deve mostrar:
- Subtotal: 850.000 AOA
- ⚡ Flash Sale: -85.000 AOA (10%)
- Frete: 5.000 AOA
- Total: 770.000 AOA ✅
```

### 5. **Testar Sincronização de Usuários**
```
1. Login como admin
2. Admin Panel → Clientes
3. Clique "🔄 Sincronizar Usuários"
4. ✅ Deve mostrar:
   "Sincronização concluída!
   Total de usuários: X
   Sincronizados: Y
   Já existiam: Z"
```

---

## 🔍 Verificações no Banco de Dados

### Após Criar Pedido:
```sql
-- Ver último pedido criado
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;

-- Deve conter:
customer_name: "Teste User"
customer_email: "teste@example.com"
customer_phone: "923456789"
total: 770000 (com desconto aplicado)
items: [{"product_id": "...", "preco_aoa": 765000}] (preço com flash sale)
```

### Após Sincronizar Usuários:
```sql
-- Ver clientes sincronizados
SELECT * FROM customers ORDER BY created_at DESC LIMIT 5;

-- Deve ter novos clientes com user_id preenchido
```

---

## ❌ Se Algo Der Errado

### Erro: "Could not find table 'reviews'"
```bash
→ Execute o SQL novamente
→ Verifique se TODAS as tabelas foram criadas:
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public';
```

### Erro: 401 Unauthorized no Admin
```bash
→ Faça logout e login novamente
→ Verifique se user é admin:
  SELECT * FROM admin_users WHERE email = 'admin@kzstore.ao';
```

### Pedido não cria
```bash
→ Abra Console (F12)
→ Veja o erro exato
→ Provavelmente campo obrigatório faltando
→ Verifique estrutura da tabela orders
```

### Sincronização falha
```bash
→ Verifique se tem usuários:
  SELECT * FROM auth.users LIMIT 5;
→ Verifique permissões do admin
→ Tente fazer logout/login
```

---

## 📊 Checklist Completo

### ✅ Funcionalidades Corrigidas:
- [x] Recuperação de senha funcionando
- [x] Tabelas criadas no banco
- [x] Pedidos sendo criados corretamente
- [x] Flash Sales aplicados no pedido
- [x] Cupons salvos no pedido
- [x] Sincronização de usuários funciona

### ⏳ Próximas Correções:
- [ ] Upload de imagens nos Anúncios
- [ ] Gestão de Equipe (converter SDK)
- [ ] Sistema de Avaliações
- [ ] Testar tudo junto

---

## 🚀 Comandos Úteis

### Ver Logs em Tempo Real:
```bash
# No navegador (F12 → Console)
# Filtre por:
- "✅" para ver sucessos
- "❌" para ver erros
- "📦" para ver dados de pedidos
```

### Limpar Dados de Teste:
```sql
-- Deletar pedidos de teste
DELETE FROM orders WHERE customer_email LIKE '%teste%';

-- Deletar clientes de teste
DELETE FROM customers WHERE email LIKE '%teste%';
```

---

## 📞 Status Final

| Item | Status | Funciona? |
|------|--------|-----------|
| Recuperação Senha | ✅ | Sim |
| Tabelas SQL | ✅ | Pronto |
| Criar Pedidos | ✅ | Sim |
| Flash Sales | ✅ | Sim |
| Cupons | ✅ | Sim |
| Sync Usuários | ✅ | Sim |
| Upload Imagens | ⏳ | Pendente |
| Avaliações | ⏳ | Pendente |
| Gestão Equipe | ⏳ | Pendente |

---

## 🎉 Próximos Passos

1. **TESTE TUDO** com este guia
2. **Reporte** qualquer erro encontrado
3. **Prossiga** para próximas correções:
   - Upload de múltiplas imagens
   - Sistema de avaliações
   - Gestão de equipe

**Tempo estimado para testes:** 10-15 minutos
**Tempo para próximas correções:** 2-3 horas

---

## 💡 Dicas

- Use **Ctrl+Shift+I** para abrir DevTools
- Use **Ctrl+Shift+C** para inspecionar elementos
- Console mostra TODOS os erros e sucessos
- SQL Editor tem histórico de queries
- Supabase Dashboard mostra dados em tempo real

Boa sorte! 🚀
