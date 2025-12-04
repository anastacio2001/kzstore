# 🚚 SISTEMA DE FRETE AVANÇADO - KZSTORE

## 📋 Resumo das Alterações

### Novo Sistema de Frete com 5 Opções:

1. **🎁 Frete Grátis para TODAS as Províncias** (`free_all`)
   - Cliente não paga frete em nenhuma província
   - Use para produtos com entrega grátis nacional

2. **🏙️ Frete Grátis apenas em LUANDA** (`free_luanda`)
   - Grátis somente em Luanda
   - Outras províncias usam frete dinâmico (tabela do sistema)
   - Perfeito para produtos pesados/volumosos

3. **📍 Frete Grátis em Províncias Específicas** (`free_custom`)
   - Selecione manualmente as províncias com frete grátis
   - Exemplo: Grátis em Luanda, Bengo e Benguela
   - Outras províncias usam frete dinâmico

4. **💰 Frete Pago (Valor Fixo)** (`paid_fixed`)
   - Define um valor fixo de frete para TODAS as províncias
   - Exemplo: 5.000 Kz para qualquer província

5. **🧮 Frete Dinâmico** (`dynamic`)
   - Usa tabela de frete configurada no sistema
   - Calcula automaticamente por província e peso
   - Recomendado para a maioria dos produtos

---

## 🔧 Como Usar no Admin

### Ao Criar/Editar um Produto:

1. **Vá para a seção "🚚 Configurações de Frete"**
2. **Selecione o tipo de frete** no dropdown
3. **Configure conforme a opção:**

#### Para "Frete Grátis em Províncias Específicas":
- Marque as províncias desejadas na lista
- Exemplo: ✅ Luanda, ✅ Bengo

#### Para "Frete Pago (Valor Fixo)":
- Digite o valor em AOA (ex: 5000)
- Opcional: valor em USD

4. **Veja o resumo visual** que mostra como o frete será aplicado
5. **Salve o produto**

---

## 💻 Como Funciona no Checkout

### Cálculo do Frete:

1. **Sistema verifica cada produto no carrinho**
2. **Para cada produto, aplica a regra de frete:**
   - `free_all` → Não adiciona frete
   - `free_luanda` → Grátis se província = Luanda, senão usa dinâmico
   - `free_custom` → Grátis se província está na lista, senão usa dinâmico
   - `paid_fixed` → Adiciona valor fixo configurado
   - `dynamic` → Usa tabela de frete do sistema

3. **Se TODOS produtos têm frete grátis na província selecionada:**
   - Frete final = 0 Kz ✅

4. **Senão:**
   - Frete final = MAX(frete_calculado, frete_dinâmico)

---

## 🗄️ Estrutura no Banco de Dados

### Tabela `products`:

```sql
shipping_type VARCHAR(30)           -- Tipo de frete
shipping_cost_aoa DECIMAL(10,2)     -- Valor fixo em AOA
shipping_cost_usd DECIMAL(10,2)     -- Valor fixo em USD
free_shipping_provinces JSON        -- Array de províncias: ["Luanda", "Bengo"]
```

### Valores de `shipping_type`:
- `free_all`
- `free_luanda`
- `free_custom`
- `paid_fixed`
- `dynamic`

---

## 📊 Migração de Dados Antigos

**Executado automaticamente:**
- `free` → `free_all` (frete grátis em todas)
- `paid` → `paid_fixed` (frete pago fixo)
- `NULL` → `dynamic` (frete dinâmico)

---

## ✅ Benefícios

1. **Flexibilidade Total** - Configure frete produto por produto
2. **Estratégias de Venda** - Ofereça frete grátis em regiões específicas
3. **Controle de Custos** - Decida onde quer subsidiar o frete
4. **UX Melhorada** - Cliente vê claramente se tem frete grátis
5. **Relatórios** - Saiba quais produtos têm frete grátis por região

---

## 🎯 Casos de Uso

### Produto Pequeno (USB, Cartão SD):
- **Opção:** `free_all`
- **Motivo:** Barato enviar para qualquer lugar

### Notebook, Monitor:
- **Opção:** `free_luanda`
- **Motivo:** Pesado, caro enviar para interior

### Promoção Regional:
- **Opção:** `free_custom` (Luanda, Bengo, Benguela)
- **Motivo:** Incentivar vendas em regiões específicas

### Móvel, Equipamento Grande:
- **Opção:** `paid_fixed` (10.000 Kz)
- **Motivo:** Controlar custo de logística

### Padrão:
- **Opção:** `dynamic`
- **Motivo:** Sistema calcula automaticamente

---

## 🔍 Verificar Configurações

### SQL para ver produtos por tipo de frete:

```sql
SELECT 
  shipping_type, 
  COUNT(*) as total_produtos,
  SUM(CASE WHEN shipping_type LIKE 'free%' THEN 1 ELSE 0 END) as com_frete_gratis
FROM products 
GROUP BY shipping_type;
```

### Produtos com frete grátis customizado:

```sql
SELECT nome, shipping_type, free_shipping_provinces
FROM products 
WHERE shipping_type = 'free_custom';
```

---

## 📝 Newsletter no Admin

**Localização:** Admin → Newsletter (menu lateral)

**Funcionalidades:**
- Ver todos os inscritos
- Exportar lista de emails
- Filtrar por status (ativo, cancelado)
- Ver fonte de inscrição (footer, blog, popup)
- Gerenciar campanhas de email

---

## 🚀 Deploy Realizado

✅ Schema atualizado
✅ Migração aplicada no banco
✅ Formulário admin atualizado
✅ Checkout funcionando
✅ Build testado e OK

**Data:** 2 de dezembro de 2025
**Versão:** BUILD 132 - Advanced Shipping System
