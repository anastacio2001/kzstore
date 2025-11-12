# 🎨 Novas Funcionalidades Admin - Guia Rápido

## ✅ O que foi criado

### 1. **Gerenciador de Banner Principal (Hero Section)**
Permite editar o banner da página inicial diretamente pelo painel admin.

**Funcionalidades:**
- ✅ Editar título e subtítulo
- ✅ Mudar descrição
- ✅ Alterar imagem
- ✅ Configurar botões (texto e links)
- ✅ Editar badge de novidade
- ✅ Personalizar estatísticas
- ✅ Ativar/Desativar banners
- ✅ Criar múltiplos banners

### 2. **Gerenciador de Categorias e Subcategorias**
Sistema completo para organizar produtos.

**Funcionalidades:**
- ✅ Criar/Editar/Excluir categorias
- ✅ Criar/Editar/Excluir subcategorias
- ✅ Ativar/Desativar categorias
- ✅ Escolher ícones (Lucide)
- ✅ Definir cores personalizadas
- ✅ Controlar exibição no menu
- ✅ Controlar exibição na homepage
- ✅ Ordenar por prioridade
- ✅ Interface expansível (tree view)

---

## 📋 Como Aplicar no Banco de Dados

### Opção 1: SQL Editor do Supabase (Recomendado)

1. **Acesse o Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Selecione seu projeto

2. **Vá até o SQL Editor:**
   - Menu lateral: **SQL Editor**
   - Clique em **New Query**

3. **Copie e Cole o Script:**
   - Abra o arquivo: `supabase/migrations/EXECUTE_THIS_IN_SUPABASE.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor

4. **Execute:**
   - Clique em **Run** (ou Ctrl+Enter)
   - Aguarde confirmação de sucesso ✅

5. **Verifique:**
   ```sql
   SELECT * FROM hero_sections;
   SELECT * FROM categories ORDER BY display_order;
   SELECT COUNT(*) FROM subcategories;
   ```

---

## 🚀 Como Usar no Painel Admin

### Acessar as Novas Funcionalidades

1. **Faça login no admin:**
   - Email: `admin@kzstore.ao`
   - Senha: `admin123`

2. **No painel admin, você verá 2 NOVAS ABAS:**
   - 📸 **Banner Home** - Gerenciar hero section
   - 📁 **Categorias** - Gerenciar categorias e subcategorias

---

### 📸 Gerenciar Banner Principal

#### Editar Banner Existente:
1. Clique na aba **"Banner Home"**
2. Clique no botão **🖼️ Editar** do banner
3. Modifique:
   - Título principal e subtítulo
   - Descrição
   - URL da imagem
   - Textos dos botões
   - Badge de novidade
   - Estatísticas
4. Clique em **💾 Salvar**

#### Criar Novo Banner:
1. Clique em **➕ Novo Banner**
2. Preencha todos os campos
3. Marque **"Banner Ativo"** se quiser que apareça imediatamente
4. Clique em **💾 Salvar**

#### Ativar/Desativar Banner:
- Clique no ícone **👁️** (olho) para alternar status

---

### 📁 Gerenciar Categorias

#### Criar Nova Categoria:
1. Clique na aba **"Categorias"**
2. Clique em **📁 Nova Categoria**
3. Preencha:
   - **Nome:** Nome da categoria (ex: "Gaming")
   - **Slug:** URL amigável (auto-gerado se vazio)
   - **Descrição:** Breve descrição
   - **Ícone:** Nome do ícone Lucide (ex: "Monitor", "Laptop", "Server")
   - **Cor:** Escolha uma cor para a categoria
   - **Imagem URL:** (opcional) URL de imagem
4. Marque as opções:
   - ✅ **Ativo** - Categoria visível
   - ✅ **Mostrar no Menu** - Aparece no menu de navegação
   - ✅ **Mostrar na Homepage** - Aparece na página inicial
5. Clique em **💾 Salvar**

#### Criar Subcategoria:
1. Na lista de categorias, clique no **➕** da categoria pai
2. Preencha:
   - **Nome:** Nome da subcategoria
   - **Slug:** URL amigável
   - **Descrição:** Breve descrição
3. Clique em **💾 Salvar**

#### Expandir/Colapsar Categoria:
- Clique na **seta** (▶️ / ▼) ao lado da categoria para ver subcategorias

#### Editar Categoria/Subcategoria:
- Clique no botão **✏️ Editar**
- Modifique os campos desejados
- Clique em **💾 Salvar**

#### Ativar/Desativar:
- Clique no ícone **👁️** (olho) para alternar status

#### Excluir:
- Clique no ícone **🗑️ Lixeira**
- Confirme a exclusão
- ⚠️ **ATENÇÃO:** Excluir categoria também exclui todas suas subcategorias!

---

## 🎨 Lista de Ícones Disponíveis (Lucide Icons)

Use estes nomes no campo "Ícone":

**Categorias Comuns:**
- `Monitor` - Monitores/Computadores
- `Laptop` - Notebooks
- `Cpu` - Processadores/Componentes
- `Keyboard` - Teclados/Periféricos
- `HardDrive` - Armazenamento
- `Wifi` - Redes
- `Server` - Servidores
- `Smartphone` - Celulares
- `Gamepad2` - Gaming
- `Zap` - Flash/Performance
- `ShoppingBag` - Vendas/Ofertas
- `Package` - Produtos
- `Tag` - Promoções

**Ver mais:** https://lucide.dev/icons/

---

## 🎯 Categorias Padrão Criadas

O script já cria 8 categorias com subcategorias:

1. **Computadores**
   - Desktop Gaming
   - Workstations
   - All-in-One

2. **Laptops**
   - Gaming
   - Ultrabooks
   - Business

3. **Componentes**
   - Processadores
   - Placas-Mãe
   - Memória RAM
   - Placas de Vídeo

4. **Periféricos**
   - Teclados
   - Mouses
   - Monitores

5. **Armazenamento**
   - SSDs
   - HDDs
   - Externos

6. **Redes**
7. **Servidores**
8. **Smartphones**

---

## 📊 Vincular Produtos às Categorias

**Futuro:** Quando editar produtos, poderá selecionar:
- Categoria principal
- Subcategoria

Isso permitirá:
- Filtros por categoria
- Navegação organizada
- Busca mais eficiente
- SEO melhorado

---

## 🐛 Troubleshooting

### Erro ao executar SQL:
- **Problema:** "already exists"
- **Solução:** Normal! Significa que já foi criado antes

### Não aparece no admin:
- **Problema:** Tabs não aparecem
- **Solução:** Faça logout e login novamente

### Imagens não aparecem:
- **Problema:** URLs de imagens quebradas
- **Solução:** Use URLs completas (https://...) ou faça upload no Supabase Storage

### Categorias não aparecem no site:
- **Problema:** Categoria marcada como inativa
- **Solução:** No admin, clique no 👁️ para ativar

---

## ✅ Próximos Passos

Após aplicar o script SQL:

1. ✅ Faça login no admin
2. ✅ Teste criar uma nova categoria
3. ✅ Teste editar o banner principal
4. ✅ Verifique se as mudanças aparecem no site
5. ✅ Customize conforme necessário

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do Supabase Dashboard
3. Teste em modo incógnito para descartar cache

---

**Criado por:** GitHub Copilot  
**Data:** 12 de Novembro de 2025  
**Versão:** 1.0.0
