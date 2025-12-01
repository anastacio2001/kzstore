# 📁 Guia de Gestão de Categorias e Subcategorias

## Funcionalidade Implementada

Sistema completo de gestão de categorias e subcategorias de produtos com atualização automática em toda a plataforma!

## Como Usar

### 1️⃣ Acessar a Gestão de Categorias

1. Faça login no painel admin
2. Clique na aba **"Categorias"** (ícone de pasta 📁)
3. Você verá o gerenciador de categorias

### 2️⃣ Criar Nova Categoria

1. Clique no botão **"Nova Categoria"** (canto superior direito)
2. Preencha os campos:
   - **Nome da Categoria** (obrigatório): Ex: "Eletrônicos", "Gaming", "Periféricos"
   - **Ícone (Emoji)**: Ex: 📱, 💻, 🎮, 🖱️
3. Clique em **"Criar"**
4. A categoria aparecerá na lista imediatamente

### 3️⃣ Criar Subcategoria

1. Localize a categoria principal na lista
2. Clique no botão **"+ Subcategoria"** ao lado da categoria
3. Preencha os campos:
   - **Nome** (obrigatório): Ex: "Smartphones", "Tablets", "Notebooks"
   - **Ícone**: Ex: 📱, 📟, 💻
4. Clique em **"Criar"**
5. A subcategoria aparecerá dentro da categoria expandida

### 4️⃣ Visualizar Estrutura

- Clique na **seta** (▶) ao lado do nome da categoria para expandir/recolher
- Categorias expandidas mostram todas as subcategorias
- Contador mostra quantas subcategorias cada categoria tem

### 5️⃣ Editar Categoria/Subcategoria

1. Clique no ícone **lápis** (✏️) ao lado do item que deseja editar
2. Modifique o nome ou ícone
3. Clique em **"Atualizar"**
4. As mudanças são aplicadas instantaneamente

### 6️⃣ Excluir Categoria/Subcategoria

1. Clique no ícone **lixeira** (🗑️) ao lado do item
2. Confirme a exclusão
3. ⚠️ **ATENÇÃO**: Excluir uma categoria também exclui todas as suas subcategorias

### 7️⃣ Usar no Formulário de Produtos

Quando você criar ou editar um produto:

1. No campo **"Categoria"**, aparecerão todas as categorias criadas
2. Ao selecionar uma categoria, o campo **"Subcategoria"** aparece automaticamente
3. Escolha a subcategoria desejada (opcional)
4. Salve o produto

**As categorias são atualizadas em tempo real no formulário!**

## Estrutura de Dados

### Categoria
```typescript
{
  id: string           // Gerado automaticamente
  name: string        // Nome exibido
  icon?: string       // Emoji opcional
  order: number       // Ordem de exibição
  subcategories: []   // Lista de subcategorias
}
```

### Subcategoria
```typescript
{
  id: string          // Gerado automaticamente
  name: string       // Nome exibido
  icon?: string      // Emoji opcional
  parentId: string   // ID da categoria pai
  order: number      // Ordem dentro da categoria
}
```

## Categorias Padrão

O sistema vem com 8 categorias pré-configuradas:

1. **💾 Memória RAM**
   - DDR4, DDR5, Servidor

2. **💽 Armazenamento**
   - SSD, HDD, NVMe

3. **🖥️ Mini PCs**
   - Intel, AMD

4. **📹 Câmeras Wi-Fi**
   - Indoor, Outdoor

5. **🌐 Redes e Internet**
   - Roteadores, Switches

6. **📀 Software**
   - Sistemas Operacionais, Office

7. **📱 Telemóveis**
   - Android, iOS

8. **🔌 Acessórios**
   - Cabos, Adaptadores

## Recursos Avançados

### Estatísticas
No topo da página você vê:
- **Total de Categorias**: Número de categorias criadas
- **Total de Subcategorias**: Soma de todas as subcategorias
- **Total Geral**: Categorias + Subcategorias

### Ordem Automática
- Novas categorias aparecem no final da lista
- Ordem definida automaticamente por criação
- Futuro: Drag & Drop para reordenar

### Ícones Emoji
Use qualquer emoji:
- Windows: `Win + .`
- Mac: `Cmd + Ctrl + Space`
- Sugestões: 📱💻🖥️📹🌐💾💽🔌🎮🖱️⌨️🖨️📟🔊

### IDs Automáticos
Os IDs são gerados automaticamente:
- Categoria: nome em minúsculas com hífens
- Subcategoria: `{categoriaId}-{nome}`
- Exemplo: `minipc-intel`, `camera-outdoor`

## Integração com a Plataforma

### Formulário de Produtos
- ✅ Campo "Categoria" populado automaticamente
- ✅ Campo "Subcategoria" aparece dinamicamente
- ✅ Atualização em tempo real via eventos
- ✅ Validação: Categoria obrigatória

### Página de Produtos
- As categorias serão usadas para filtros
- Navegação por categoria/subcategoria
- URLs amigáveis: `/produtos/categoria/subcategoria`

### Dados dos Produtos
Os produtos salvam:
```typescript
{
  categoria: "minipc",        // ID da categoria
  subcategoria: "minipc-intel" // ID da subcategoria (opcional)
}
```

## Como Funciona Tecnicamente

### Armazenamento
- **localStorage**: Chave `productCategories`
- Formato: Array JSON de categorias
- Persistente no navegador

### Eventos Customizados
Quando categorias são atualizadas:
```typescript
window.dispatchEvent(new CustomEvent('categoriesUpdated', { 
  detail: categories 
}));
```

ProductForm escuta esse evento e recarrega as categorias automaticamente.

### Sincronização
1. Admin cria/edita categoria
2. Salva no localStorage
3. Dispara evento `categoriesUpdated`
4. ProductForm recebe evento
5. Atualiza dropdown de categorias
6. Usuário vê mudanças instantaneamente

## Exemplos de Uso

### Loja de Eletrônicos
```
📱 Smartphones
  ├─ Android
  ├─ iOS
  └─ Windows Phone

💻 Computadores
  ├─ Desktops
  ├─ Notebooks
  └─ Workstations

🎮 Gaming
  ├─ Consoles
  ├─ Jogos
  └─ Acessórios
```

### Loja de Moda
```
👕 Roupas Masculinas
  ├─ Camisas
  ├─ Calças
  └─ Casacos

👗 Roupas Femininas
  ├─ Vestidos
  ├─ Saias
  └─ Blusas

👟 Calçados
  ├─ Tênis
  ├─ Sapatos
  └─ Sandálias
```

### Loja de Alimentos
```
🍎 Frutas
  ├─ Cítricas
  ├─ Tropicais
  └─ Vermelhas

🥬 Vegetais
  ├─ Folhas
  ├─ Raízes
  └─ Legumes

🥛 Laticínios
  ├─ Leite
  ├─ Queijos
  └─ Iogurtes
```

## Dicas de Organização

### Estrutura Hierárquica
- Use categorias para grupos grandes
- Subcategorias para divisões específicas
- Máximo recomendado: 3-5 subcategorias por categoria

### Nomes Claros
- Use nomes descritivos
- Evite abreviações confusas
- Seja consistente no estilo

### Ícones Relevantes
- Escolha emojis representativos
- Mantenha um estilo visual coerente
- Não use ícones muito semelhantes

### Planejamento
Antes de criar, planeje:
1. Liste todos os tipos de produtos
2. Agrupe por similaridade
3. Defina hierarquia
4. Crie as categorias principais
5. Adicione subcategorias conforme necessário

## Solução de Problemas

### Categorias não aparecem no formulário
- Recarregue a página do admin
- Verifique o console (F12) por erros
- Confirme que salvou as categorias
- Limpe o cache: `localStorage.clear()` e recrie

### Subcategorias não aparecem
- Verifique se selecionou uma categoria primeiro
- Confirme que a categoria tem subcategorias
- Expanda a categoria na lista para ver

### Erro ao criar categoria
- Nome não pode estar vazio
- Evite caracteres especiais no nome
- Tente usar um nome diferente

### Categorias desapareceram
- Verifique o localStorage no console:
  ```javascript
  JSON.parse(localStorage.getItem('productCategories'))
  ```
- Se vazio, clique em "Restaurar Padrão"

## Próximos Passos

Funcionalidades futuras planejadas:
- [ ] Salvar categorias no banco de dados (MySQL)
- [ ] Drag & Drop para reordenar
- [ ] Imagens para categorias (além de emojis)
- [ ] Categorias com múltiplos níveis (sub-subcategorias)
- [ ] Importação/Exportação de categorias
- [ ] Templates de categorias por tipo de loja
- [ ] Estatísticas de produtos por categoria
- [ ] Bulk edit de categorias
- [ ] Histórico de alterações

## Migração para Banco de Dados

Quando migrar do localStorage para MySQL:

```sql
CREATE TABLE categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10),
  parent_id VARCHAR(100) NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

## API Endpoints (Futuro)

```typescript
// Listar todas as categorias
GET /api/categories

// Criar nova categoria
POST /api/categories
Body: { name, icon, parentId? }

// Atualizar categoria
PUT /api/categories/:id
Body: { name?, icon? }

// Excluir categoria
DELETE /api/categories/:id

// Reordenar categorias
PUT /api/categories/reorder
Body: { categories: [{ id, order }] }
```

## Suporte

Se tiver dúvidas ou problemas:
1. Verifique este guia primeiro
2. Consulte os logs do console (F12)
3. Teste em modo incógnito
4. Restaure categorias padrão
5. Contate o desenvolvedor

---

**Última atualização:** 26/11/2024
**Versão:** 1.0.0
**Autor:** GitHub Copilot
