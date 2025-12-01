# KZSTORE - Design System Completo
## KwanzaStore - Sistema de Design para E-commerce Técnico

**Versão:** 1.0  
**Data:** 25 de Novembro de 2024  
**Para:** Desenvolvimento e Implementação

---

## 📋 Índice

1. [Introdução](#introdução)
2. [Paleta de Cores](#paleta-de-cores)
3. [Tipografia](#tipografia)
4. [Espaçamento e Grid](#espaçamento-e-grid)
5. [Componentes](#componentes)
6. [Ícones](#ícones)
7. [Animações e Transições](#animações-e-transições)
8. [Responsividade](#responsividade)
9. [Padrões de Interação](#padrões-de-interação)
10. [Tom e Voz](#tom-e-voz)

---

## 1. Introdução

### Propósito
O Design System da KZSTORE foi criado para garantir consistência visual e de experiência em toda a plataforma de e-commerce técnico, focada no mercado angolano de produtos eletrônicos de nicho.

### Princípios de Design
- **Clareza Técnica**: Apresentação clara de especificações técnicas complexas
- **Confiança**: Design profissional que transmite credibilidade
- **Localização**: Adaptado ao contexto angolano (Kwanzas, Multicaixa, WhatsApp)
- **Acessibilidade**: Legível e utilizável em diferentes dispositivos e conexões
- **Eficiência**: Navegação rápida para profissionais técnicos

---

## 2. Paleta de Cores

### Cores Primárias

```css
/* Vermelho Principal - Cor da marca */
--color-primary: #E31E24;
--color-primary-dark: #C01A1F;
--color-primary-light: #FF3D42;
--color-primary-50: rgba(227, 30, 36, 0.1);
--color-primary-100: rgba(227, 30, 36, 0.2);

/* Amarelo Secundário - Destaque */
--color-secondary: #FDD835;
--color-secondary-dark: #F9A825;
--color-secondary-light: #FFEB3B;

/* Azul Terciário - Informação */
--color-tertiary: #1976D2;
--color-tertiary-dark: #1565C0;
--color-tertiary-light: #42A5F5;
```

### Cores Neutras

```css
/* Escala de Cinza */
--color-gray-50: #FAFAFA;
--color-gray-100: #F5F5F5;
--color-gray-200: #EEEEEE;
--color-gray-300: #E0E0E0;
--color-gray-400: #BDBDBD;
--color-gray-500: #9E9E9E;
--color-gray-600: #757575;
--color-gray-700: #616161;
--color-gray-800: #424242;
--color-gray-900: #212121;

/* Branco e Preto */
--color-white: #FFFFFF;
--color-black: #000000;
```

### Cores de Status

```css
/* Sucesso */
--color-success: #4CAF50;
--color-success-light: #81C784;
--color-success-dark: #388E3C;

/* Aviso */
--color-warning: #FF9800;
--color-warning-light: #FFB74D;
--color-warning-dark: #F57C00;

/* Erro */
--color-error: #F44336;
--color-error-light: #E57373;
--color-error-dark: #D32F2F;

/* Informação */
--color-info: #2196F3;
--color-info-light: #64B5F6;
--color-info-dark: #1976D2;
```

### Aplicação de Cores

| Elemento | Cor | Uso |
|----------|-----|-----|
| Botão Primário | `#E31E24` | Call-to-actions principais (Adicionar ao Carrinho, Finalizar Compra) |
| Botão Secundário | `#FDD835` | Ações secundárias (Ver Detalhes, Continuar Comprando) |
| Links | `#1976D2` | Navegação e hyperlinks |
| Texto Principal | `#212121` | Corpo de texto, títulos principais |
| Texto Secundário | `#757575` | Descrições, metadados, legendas |
| Fundo | `#FAFAFA` | Background geral da página |
| Cartões | `#FFFFFF` | Cards de produto, containers |
| Bordas | `#E0E0E0` | Divisores, bordas de inputs |

---

## 3. Tipografia

### Família de Fontes

```css
/* Fonte Principal */
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
                sans-serif;

/* Fonte Monospace (para códigos técnicos) */
--font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 
             'Fira Mono', 'Droid Sans Mono', 'Courier New', monospace;
```

### Hierarquia Tipográfica

#### Desktop

| Estilo | Tamanho | Peso | Line Height | Uso |
|--------|---------|------|-------------|-----|
| **H1** | 36px | 700 | 1.2 | Título principal da página |
| **H2** | 30px | 700 | 1.3 | Seções principais |
| **H3** | 24px | 600 | 1.4 | Subtítulos de seção |
| **H4** | 20px | 600 | 1.4 | Títulos de card |
| **H5** | 18px | 600 | 1.5 | Subtítulos menores |
| **Body Large** | 18px | 400 | 1.6 | Texto destacado |
| **Body** | 16px | 400 | 1.6 | Texto padrão |
| **Body Small** | 14px | 400 | 1.5 | Texto secundário |
| **Caption** | 12px | 400 | 1.4 | Legendas, metadados |
| **Button** | 16px | 600 | 1 | Texto de botões |
| **Code** | 14px | 400 | 1.5 | Especificações técnicas |

#### Mobile

| Estilo | Tamanho | Peso | Line Height |
|--------|---------|------|-------------|
| **H1** | 28px | 700 | 1.2 |
| **H2** | 24px | 700 | 1.3 |
| **H3** | 20px | 600 | 1.4 |
| **H4** | 18px | 600 | 1.4 |
| **Body** | 16px | 400 | 1.6 |
| **Body Small** | 14px | 400 | 1.5 |

### Classes Tailwind Correspondentes

```tsx
// Títulos
<h1 className="text-4xl font-bold leading-tight">         // H1
<h2 className="text-3xl font-bold leading-snug">          // H2
<h3 className="text-2xl font-semibold leading-normal">    // H3
<h4 className="text-xl font-semibold leading-normal">     // H4

// Corpo de texto
<p className="text-base leading-relaxed">                 // Body
<p className="text-sm leading-normal">                    // Body Small
<span className="text-xs leading-snug">                   // Caption

// Código técnico
<code className="font-mono text-sm">                      // Code
```

---

## 4. Espaçamento e Grid

### Escala de Espaçamento

Baseada em múltiplos de 4px para consistência:

```css
--spacing-1: 4px;    /* 0.25rem */
--spacing-2: 8px;    /* 0.5rem */
--spacing-3: 12px;   /* 0.75rem */
--spacing-4: 16px;   /* 1rem */
--spacing-5: 20px;   /* 1.25rem */
--spacing-6: 24px;   /* 1.5rem */
--spacing-8: 32px;   /* 2rem */
--spacing-10: 40px;  /* 2.5rem */
--spacing-12: 48px;  /* 3rem */
--spacing-16: 64px;  /* 4rem */
--spacing-20: 80px;  /* 5rem */
--spacing-24: 96px;  /* 6rem */
```

### Grid System

```css
/* Container Principal */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Grid de Produtos */
.product-grid {
  display: grid;
  gap: 24px;
}

/* Breakpoints do Grid */
@media (min-width: 640px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 768px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .product-grid { grid-template-columns: repeat(4, 1fr); }
}
```

### Layout de Página

```
┌─────────────────────────────────────────┐
│          Header (64px altura)           │ 
├─────────────────────────────────────────┤
│ Breadcrumb (40px altura + 16px margin)  │
├─────────────────────────────────────────┤
│                                         │
│         Conteúdo Principal              │
│         (padding: 32px lateral)         │
│         (max-width: 1280px)             │
│                                         │
├─────────────────────────────────────────┤
│         Footer (altura variável)        │
└─────────────────────────────────────────┘
```

---

## 5. Componentes

### 5.1 Botões

#### Variações

**Botão Primário**
```tsx
<button className="px-6 py-3 bg-[#E31E24] text-white rounded-lg 
                   hover:bg-[#C01A1F] transition-colors font-semibold
                   shadow-md hover:shadow-lg">
  Adicionar ao Carrinho
</button>
```
- Background: `#E31E24`
- Hover: `#C01A1F`
- Padding: `24px (horizontal) x 12px (vertical)`
- Border Radius: `8px`
- Sombra: `shadow-md` normal, `shadow-lg` no hover

**Botão Secundário**
```tsx
<button className="px-6 py-3 bg-[#FDD835] text-gray-900 rounded-lg 
                   hover:bg-[#F9A825] transition-colors font-semibold
                   shadow-md hover:shadow-lg">
  Ver Detalhes
</button>
```
- Background: `#FDD835`
- Hover: `#F9A825`
- Texto: `#212121`

**Botão Outline**
```tsx
<button className="px-6 py-3 border-2 border-[#E31E24] text-[#E31E24] 
                   rounded-lg hover:bg-[#E31E24] hover:text-white 
                   transition-colors font-semibold">
  Continuar Comprando
</button>
```

**Botão WhatsApp**
```tsx
<button className="px-6 py-3 bg-[#25D366] text-white rounded-lg 
                   hover:bg-[#1DA851] transition-colors font-semibold
                   flex items-center gap-2">
  <MessageCircle className="w-5 h-5" />
  Contactar via WhatsApp
</button>
```
- Background: `#25D366` (verde WhatsApp oficial)
- Hover: `#1DA851`

#### Estados dos Botões

| Estado | Estilo |
|--------|--------|
| Normal | Cor padrão + `shadow-md` |
| Hover | Cor escurecida + `shadow-lg` + `scale-105` |
| Active | Cor escurecida + `scale-95` |
| Disabled | `opacity-50` + `cursor-not-allowed` |
| Loading | Spinner animado + texto "Carregando..." |

#### Tamanhos

```tsx
// Pequeno
<button className="px-4 py-2 text-sm">...</button>

// Médio (padrão)
<button className="px-6 py-3 text-base">...</button>

// Grande
<button className="px-8 py-4 text-lg">...</button>

// Full Width
<button className="w-full px-6 py-3">...</button>
```

### 5.2 Cards de Produto

```tsx
<div className="bg-white rounded-lg shadow-md hover:shadow-xl 
                transition-shadow overflow-hidden border border-gray-200">
  {/* Imagem */}
  <div className="aspect-square relative bg-gray-100">
    <img src="..." alt="..." className="w-full h-full object-contain p-4" />
    {/* Badge de Stock */}
    <div className="absolute top-2 right-2 bg-green-500 text-white 
                    text-xs px-2 py-1 rounded-full">
      Em Stock
    </div>
  </div>
  
  {/* Conteúdo */}
  <div className="p-4">
    {/* Categoria */}
    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
      Memória RAM
    </p>
    
    {/* Nome do Produto */}
    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
      Kingston DDR4 32GB 2666MHz ECC
    </h3>
    
    {/* Especificações Chave */}
    <div className="text-xs text-gray-600 space-y-1 mb-3">
      <p>• 32GB DDR4</p>
      <p>• 2666MHz</p>
      <p>• ECC Registered</p>
    </div>
    
    {/* Preço */}
    <div className="mb-3">
      <p className="text-2xl font-bold text-[#E31E24]">
        75.000 Kz
      </p>
      <p className="text-xs text-gray-500">
        ~85 USD
      </p>
    </div>
    
    {/* Botão */}
    <button className="w-full bg-[#E31E24] text-white py-2 rounded-lg
                       hover:bg-[#C01A1F] transition-colors font-semibold">
      Ver Detalhes
    </button>
  </div>
</div>
```

**Especificações do Card:**
- Largura: Responsiva (grid-based)
- Border Radius: `8px`
- Sombra Normal: `shadow-md`
- Sombra Hover: `shadow-xl`
- Padding Conteúdo: `16px`
- Imagem Aspect Ratio: `1:1` (quadrado)
- Imagem Object Fit: `contain` com padding `16px`

### 5.3 Inputs e Forms

**Input de Texto**
```tsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Nome Completo
  </label>
  <input 
    type="text"
    className="w-full px-4 py-3 border border-gray-300 rounded-lg
               focus:ring-2 focus:ring-[#E31E24] focus:border-transparent
               outline-none transition-all"
    placeholder="Digite seu nome"
  />
</div>
```

**Select / Dropdown**
```tsx
<select className="w-full px-4 py-3 border border-gray-300 rounded-lg
                   focus:ring-2 focus:ring-[#E31E24] focus:border-transparent
                   outline-none transition-all bg-white">
  <option>Selecione uma opção</option>
  <option>Opção 1</option>
</select>
```

**Checkbox**
```tsx
<label className="flex items-center space-x-3 cursor-pointer">
  <input 
    type="checkbox"
    className="w-5 h-5 text-[#E31E24] border-gray-300 rounded
               focus:ring-[#E31E24] focus:ring-offset-0"
  />
  <span className="text-sm text-gray-700">
    Concordo com os termos
  </span>
</label>
```

**Radio Button**
```tsx
<label className="flex items-center space-x-3 cursor-pointer">
  <input 
    type="radio"
    className="w-5 h-5 text-[#E31E24] border-gray-300
               focus:ring-[#E31E24] focus:ring-offset-0"
  />
  <span className="text-sm text-gray-700">
    Multicaixa Express
  </span>
</label>
```

**Estados do Input:**
- Normal: Border `#E0E0E0`
- Focus: Ring `#E31E24` 2px
- Error: Border `#F44336` + texto de erro vermelho
- Disabled: Background `#F5F5F5` + opacity `0.6`

### 5.4 Badges e Tags

**Badge de Status**
```tsx
// Em Stock
<span className="inline-flex items-center px-3 py-1 rounded-full 
                 text-xs font-medium bg-green-100 text-green-800">
  Em Stock
</span>

// Esgotado
<span className="inline-flex items-center px-3 py-1 rounded-full 
                 text-xs font-medium bg-red-100 text-red-800">
  Esgotado
</span>

// Sob Encomenda
<span className="inline-flex items-center px-3 py-1 rounded-full 
                 text-xs font-medium bg-yellow-100 text-yellow-800">
  Sob Encomenda
</span>

// Promoção
<span className="inline-flex items-center px-3 py-1 rounded-full 
                 text-xs font-medium bg-[#E31E24] text-white">
  -15% OFF
</span>
```

**Tag de Categoria**
```tsx
<span className="inline-flex items-center px-2 py-1 rounded 
                 text-xs bg-gray-200 text-gray-700">
  DDR4
</span>
```

### 5.5 Navegação

**Header Principal**
```tsx
<header className="bg-white shadow-md sticky top-0 z-50">
  <div className="container mx-auto px-6">
    <div className="h-16 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-[#E31E24] rounded flex items-center justify-center">
          <span className="text-white font-bold text-xl">KZ</span>
        </div>
        <span className="font-bold text-xl text-gray-900">KZSTORE</span>
      </div>
      
      {/* Navegação Desktop */}
      <nav className="hidden md:flex items-center gap-6">
        <a href="#" className="text-gray-700 hover:text-[#E31E24] 
                               transition-colors font-medium">
          Produtos
        </a>
        <a href="#" className="text-gray-700 hover:text-[#E31E24] 
                               transition-colors font-medium">
          Categorias
        </a>
        <a href="#" className="text-gray-700 hover:text-[#E31E24] 
                               transition-colors font-medium">
          Contacto
        </a>
      </nav>
      
      {/* Ações */}
      <div className="flex items-center gap-4">
        <button className="relative">
          <ShoppingCart className="w-6 h-6 text-gray-700" />
          <span className="absolute -top-2 -right-2 w-5 h-5 
                          bg-[#E31E24] text-white text-xs rounded-full 
                          flex items-center justify-center">
            3
          </span>
        </button>
        <button className="md:hidden">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  </div>
</header>
```

**Breadcrumb**
```tsx
<nav className="flex items-center gap-2 text-sm text-gray-600 py-3">
  <a href="#" className="hover:text-[#E31E24] transition-colors">
    Início
  </a>
  <ChevronRight className="w-4 h-4" />
  <a href="#" className="hover:text-[#E31E24] transition-colors">
    Produtos
  </a>
  <ChevronRight className="w-4 h-4" />
  <span className="text-gray-900 font-medium">
    Memória RAM
  </span>
</nav>
```

### 5.6 Alertas e Notificações

**Alert Success**
```tsx
<div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
  <div className="flex items-start">
    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
    <div>
      <p className="font-medium text-green-800">Sucesso!</p>
      <p className="text-sm text-green-700">
        Produto adicionado ao carrinho com sucesso.
      </p>
    </div>
  </div>
</div>
```

**Alert Error**
```tsx
<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
  <div className="flex items-start">
    <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
    <div>
      <p className="font-medium text-red-800">Erro!</p>
      <p className="text-sm text-red-700">
        Não foi possível processar o pagamento.
      </p>
    </div>
  </div>
</div>
```

**Toast Notification**
```tsx
// Usar biblioteca 'sonner'
import { toast } from 'sonner@2.0.3';

toast.success('Produto adicionado ao carrinho!');
toast.error('Erro ao adicionar produto');
toast.info('Verificando disponibilidade...');
```

### 5.7 Modal / Dialog

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
  
  {/* Modal */}
  <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full 
                  mx-4 max-h-[90vh] overflow-y-auto">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b">
      <h2 className="text-xl font-bold text-gray-900">
        Título do Modal
      </h2>
      <button className="text-gray-400 hover:text-gray-600">
        <X className="w-6 h-6" />
      </button>
    </div>
    
    {/* Conteúdo */}
    <div className="p-6">
      <p className="text-gray-700">
        Conteúdo do modal...
      </p>
    </div>
    
    {/* Footer */}
    <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
      <button className="px-4 py-2 border border-gray-300 rounded-lg
                         text-gray-700 hover:bg-gray-100 transition-colors">
        Cancelar
      </button>
      <button className="px-4 py-2 bg-[#E31E24] text-white rounded-lg
                         hover:bg-[#C01A1F] transition-colors">
        Confirmar
      </button>
    </div>
  </div>
</div>
```

### 5.8 Tabelas

```tsx
<div className="overflow-x-auto rounded-lg border border-gray-200">
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium 
                       text-gray-500 uppercase tracking-wider">
          Produto
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium 
                       text-gray-500 uppercase tracking-wider">
          Quantidade
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium 
                       text-gray-500 uppercase tracking-wider">
          Preço
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 text-sm text-gray-900">
          Kingston DDR4 32GB
        </td>
        <td className="px-6 py-4 text-sm text-gray-700">
          2
        </td>
        <td className="px-6 py-4 text-sm font-medium text-gray-900">
          150.000 Kz
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 5.9 Loading States

**Spinner**
```tsx
<div className="flex items-center justify-center">
  <div className="w-8 h-8 border-4 border-gray-200 border-t-[#E31E24] 
                  rounded-full animate-spin" />
</div>
```

**Skeleton Loading**
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
  <div className="h-4 bg-gray-200 rounded w-5/6" />
</div>
```

**Progress Bar**
```tsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div className="bg-[#E31E24] h-2 rounded-full transition-all duration-300"
       style={{ width: '60%' }} />
</div>
```

### 5.10 Filtros e Busca

**Barra de Busca**
```tsx
<div className="relative">
  <input 
    type="text"
    placeholder="Buscar produtos..."
    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg
               focus:ring-2 focus:ring-[#E31E24] focus:border-transparent
               outline-none"
  />
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 
                     w-5 h-5 text-gray-400" />
</div>
```

**Filtro Sidebar**
```tsx
<div className="space-y-6">
  {/* Categoria */}
  <div>
    <h3 className="font-semibold text-gray-900 mb-3">Categoria</h3>
    <div className="space-y-2">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" className="rounded text-[#E31E24]" />
        <span className="text-sm text-gray-700">Memória RAM</span>
        <span className="text-xs text-gray-500">(24)</span>
      </label>
      {/* Mais opções... */}
    </div>
  </div>
  
  {/* Range de Preço */}
  <div>
    <h3 className="font-semibold text-gray-900 mb-3">Preço</h3>
    <div className="space-y-2">
      <input 
        type="range" 
        min="0" 
        max="1000000" 
        className="w-full accent-[#E31E24]"
      />
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>0 Kz</span>
        <span>1.000.000 Kz</span>
      </div>
    </div>
  </div>
</div>
```

### 5.11 Avaliações / Reviews

```tsx
<div className="border-b border-gray-200 pb-4">
  {/* Header da Review */}
  <div className="flex items-start justify-between mb-2">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center">
          {[1,2,3,4,5].map(star => (
            <Star 
              key={star}
              className={`w-4 h-4 ${star <= 4 ? 'fill-[#FDD835] text-[#FDD835]' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-900">4.0</span>
      </div>
      <p className="text-sm font-medium text-gray-900">João Silva</p>
      <p className="text-xs text-gray-500">Compra verificada • 15 Nov 2024</p>
    </div>
  </div>
  
  {/* Conteúdo da Review */}
  <p className="text-sm text-gray-700 leading-relaxed">
    Excelente produto! Funciona perfeitamente no meu servidor Dell.
    Entrega rápida em Luanda.
  </p>
</div>
```

**Resumo de Avaliações**
```tsx
<div className="bg-gray-50 rounded-lg p-6 space-y-4">
  <div className="text-center">
    <p className="text-4xl font-bold text-gray-900 mb-1">4.5</p>
    <div className="flex items-center justify-center gap-1 mb-1">
      {[1,2,3,4,5].map(star => (
        <Star 
          key={star}
          className={`w-5 h-5 ${star <= 4 ? 'fill-[#FDD835] text-[#FDD835]' : 'text-gray-300'}`}
        />
      ))}
    </div>
    <p className="text-sm text-gray-600">Baseado em 127 avaliações</p>
  </div>
  
  {/* Distribuição de Estrelas */}
  <div className="space-y-2">
    {[5,4,3,2,1].map(rating => (
      <div key={rating} className="flex items-center gap-3">
        <span className="text-sm text-gray-600 w-16">{rating} estrelas</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#FDD835] h-2 rounded-full"
            style={{ width: `${rating * 18}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 w-12 text-right">
          {rating * 18}%
        </span>
      </div>
    ))}
  </div>
</div>
```

---

## 6. Ícones

### Biblioteca
Usar **Lucide React** para todos os ícones.

```tsx
import { 
  ShoppingCart, Search, Menu, X, ChevronRight, ChevronDown,
  Star, Heart, Eye, Share2, MessageCircle, Phone, Mail,
  User, Settings, LogOut, Package, Truck, CreditCard,
  MapPin, Clock, CheckCircle, XCircle, AlertTriangle,
  Filter, SlidersHorizontal, ArrowUpDown, Grid, List,
  Plus, Minus, Edit, Trash2, Download, Upload
} from 'lucide-react';
```

### Tamanhos Padrão

| Uso | Classe | Tamanho |
|-----|--------|---------|
| Ícone pequeno | `w-4 h-4` | 16px |
| Ícone médio | `w-5 h-5` | 20px |
| Ícone padrão | `w-6 h-6` | 24px |
| Ícone grande | `w-8 h-8` | 32px |
| Ícone hero | `w-12 h-12` | 48px |

### Ícones Principais

| Ícone | Uso |
|-------|-----|
| `ShoppingCart` | Carrinho de compras |
| `Search` | Busca de produtos |
| `Menu` | Menu mobile |
| `Star` | Avaliações |
| `Heart` | Favoritos |
| `MessageCircle` | Chat/WhatsApp |
| `Phone` | Telefone de contacto |
| `Package` | Encomendas |
| `Truck` | Envio |
| `CreditCard` | Pagamento |
| `Filter` | Filtros |
| `Grid` / `List` | Visualização de produtos |
| `User` | Perfil de usuário |

---

## 7. Animações e Transições

### Princípios de Animação
- **Duração**: Curta (150-300ms) para interações, média (300-500ms) para transições
- **Easing**: `ease-in-out` para maioria, `ease-out` para entradas
- **Performance**: Usar `transform` e `opacity` sempre que possível

### Transições Comuns

```css
/* Hover em Botões */
.btn {
  transition: all 150ms ease-in-out;
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Hover em Cards */
.card {
  transition: box-shadow 300ms ease-in-out;
}
.card:hover {
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

/* Fade In */
.fade-in {
  animation: fadeIn 300ms ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
.slide-up {
  animation: slideUp 400ms ease-out;
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Spinner */
.spinner {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Classes Tailwind para Animações

```tsx
// Transição de cores
<div className="transition-colors duration-200 ease-in-out">

// Transição de sombra
<div className="transition-shadow duration-300">

// Transição completa
<div className="transition-all duration-150 ease-in-out">

// Hover scale
<div className="hover:scale-105 transition-transform">

// Animação de pulse
<div className="animate-pulse">

// Animação de spin
<div className="animate-spin">
```

---

## 8. Responsividade

### Breakpoints

```css
/* Mobile First Approach */
/* Extra Small (default) */
< 640px

/* Small */
@media (min-width: 640px) { /* sm: */ }

/* Medium */
@media (min-width: 768px) { /* md: */ }

/* Large */
@media (min-width: 1024px) { /* lg: */ }

/* Extra Large */
@media (min-width: 1280px) { /* xl: */ }

/* 2X Large */
@media (min-width: 1536px) { /* 2xl: */ }
```

### Padrões Responsivos

**Container**
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Conteúdo */}
</div>
```

**Grid de Produtos**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
  {/* Cards de produto */}
</div>
```

**Navegação**
```tsx
{/* Desktop */}
<nav className="hidden md:flex items-center gap-6">
  {/* Links */}
</nav>

{/* Mobile */}
<button className="md:hidden">
  <Menu />
</button>
```

**Tipografia Responsiva**
```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Título Responsivo
</h1>

<p className="text-sm sm:text-base lg:text-lg">
  Texto responsivo
</p>
```

**Espaçamento Responsivo**
```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Padding que cresce com o viewport */}
</div>

<div className="space-y-4 md:space-y-6 lg:space-y-8">
  {/* Espaçamento vertical responsivo */}
</div>
```

### Layout Mobile-First

**Página de Produto**
```
Mobile (< 768px):
┌─────────────────┐
│     Imagem      │
├─────────────────┤
│  Nome/Preço     │
├─────────────────┤
│  Descrição      │
├─────────────────┤
│  Specs          │
├─────────────────┤
│  Botão Comprar  │
└─────────────────┘

Desktop (≥ 768px):
┌──────────────┬───────────────┐
│              │  Nome/Preço   │
│              ├───────────────┤
│   Imagem     │  Descrição    │
│              ├───────────────┤
│              │  Specs        │
│              ├───────────────┤
│              │ Botão Comprar │
└──────────────┴───────────────┘
```

---

## 9. Padrões de Interação

### 9.1 Adicionar ao Carrinho

**Fluxo:**
1. Usuário clica em "Adicionar ao Carrinho"
2. Botão mostra loading (spinner)
3. Toast de sucesso aparece
4. Contador do carrinho atualiza
5. Botão volta ao estado normal

```tsx
const handleAddToCart = async () => {
  setLoading(true);
  try {
    await addToCart(product);
    toast.success('Produto adicionado ao carrinho!');
    updateCartCount();
  } catch (error) {
    toast.error('Erro ao adicionar produto');
  } finally {
    setLoading(false);
  }
};
```

### 9.2 Filtros de Produto

**Comportamento:**
- Filtros aplicam instantaneamente (sem botão "Aplicar")
- Mostrar contador de produtos filtrados
- Possibilidade de limpar todos os filtros
- Estado dos filtros persistido na URL

```tsx
// URL: /produtos?categoria=ram&preco_min=50000&preco_max=200000
```

### 9.3 Paginação e Scroll Infinito

**Opções:**

**Paginação Tradicional**
```tsx
<div className="flex items-center justify-center gap-2 mt-8">
  <button className="px-3 py-2 border rounded hover:bg-gray-50">
    Anterior
  </button>
  {[1,2,3,4,5].map(page => (
    <button 
      key={page}
      className={`px-3 py-2 rounded ${page === 2 ? 'bg-[#E31E24] text-white' : 'border hover:bg-gray-50'}`}
    >
      {page}
    </button>
  ))}
  <button className="px-3 py-2 border rounded hover:bg-gray-50">
    Próximo
  </button>
</div>
```

**Load More**
```tsx
<div className="flex justify-center mt-8">
  <button className="px-6 py-3 border-2 border-[#E31E24] text-[#E31E24] 
                     rounded-lg hover:bg-[#E31E24] hover:text-white 
                     transition-colors">
    Carregar Mais Produtos
  </button>
</div>
```

### 9.4 Estados de Feedback

**Empty State**
```tsx
<div className="text-center py-12">
  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    Nenhum produto encontrado
  </h3>
  <p className="text-gray-600 mb-6">
    Tente ajustar os filtros ou buscar por outro termo
  </p>
  <button className="px-6 py-3 bg-[#E31E24] text-white rounded-lg">
    Limpar Filtros
  </button>
</div>
```

**Error State**
```tsx
<div className="text-center py-12">
  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    Erro ao carregar produtos
  </h3>
  <p className="text-gray-600 mb-6">
    Ocorreu um erro ao carregar os produtos. Tente novamente.
  </p>
  <button className="px-6 py-3 bg-[#E31E24] text-white rounded-lg">
    Tentar Novamente
  </button>
</div>
```

### 9.5 WhatsApp Integration

**Comportamento:**
- Click abre WhatsApp Web (desktop) ou app (mobile)
- Mensagem pré-formatada com informações do produto
- Número: +244931054015

```tsx
const openWhatsApp = (product) => {
  const message = encodeURIComponent(
    `Olá! Tenho interesse no produto:\n\n` +
    `${product.name}\n` +
    `Preço: ${product.price} Kz\n\n` +
    `Gostaria de mais informações.`
  );
  
  const url = `https://wa.me/244931054015?text=${message}`;
  window.open(url, '_blank');
};
```

### 9.6 Comparação de Produtos

**Máximo:** 3 produtos por vez

```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t 
                border-gray-200 p-4 z-40">
  <div className="container mx-auto flex items-center justify-between">
    <div className="flex items-center gap-4">
      <p className="font-medium text-gray-900">
        {compareList.length} produtos selecionados
      </p>
      <button className="text-sm text-gray-600 hover:text-[#E31E24]">
        Limpar todos
      </button>
    </div>
    <button className="px-6 py-3 bg-[#E31E24] text-white rounded-lg
                       hover:bg-[#C01A1F] transition-colors">
      Comparar Produtos
    </button>
  </div>
</div>
```

---

## 10. Tom e Voz

### Características da Comunicação

**Tom:** Profissional, técnico, mas acessível
**Voz:** Especialista confiável, conhecedor do mercado angolano

### Princípios de Conteúdo

1. **Clareza Técnica**: Use especificações precisas, sem jargão desnecessário
2. **Localização**: Preços em Kwanzas, referências a Luanda, Angola
3. **Confiança**: Informações verificáveis, garantias claras
4. **Suporte**: Sempre disponível via WhatsApp

### Exemplos de Mensagens

**Confirmação de Pedido**
```
✅ Pedido confirmado com sucesso!

Obrigado pela sua compra na KZSTORE.
O seu pedido #12345 foi recebido e está a ser processado.

Entrega prevista: 2-3 dias úteis em Luanda
Pagamento: Multicaixa Express

Dúvidas? Contacte-nos via WhatsApp: +244 931 054 015
```

**Produto Esgotado**
```
⚠️ Produto temporariamente esgotado

Este produto está actualmente em falta, mas pode ser encomendado.
Prazo de entrega: 7-10 dias úteis

Quer fazer a encomenda? Contacte-nos via WhatsApp para confirmar
disponibilidade e prazo exacto.
```

**Erro de Pagamento**
```
❌ Não foi possível processar o pagamento

Verificamos que houve um problema com o pagamento via Multicaixa.
Por favor, verifique os dados e tente novamente.

Precisa de ajuda? Nossa equipe está disponível via WhatsApp:
+244 931 054 015
```

### Terminologia Específica

| Termo Correcto | Evitar |
|----------------|--------|
| Kwanzas (Kz) | AOA, Kwanza |
| Entrega | Envio, Shipping |
| Carrinho | Cesta |
| Finalizar Compra | Checkout |
| Encomenda | Pedido especial |
| Em stock | Disponível |
| Esgotado | Sem stock |
| Contactar | Falar com |
| Factura | Recibo |

### Call-to-Actions

| Situação | CTA | Alternativa |
|----------|-----|-------------|
| Adicionar produto | "Adicionar ao Carrinho" | "Comprar Agora" |
| Ver mais | "Ver Detalhes" | "Saber Mais" |
| Contacto | "Contactar via WhatsApp" | "Falar Connosco" |
| Checkout | "Finalizar Compra" | "Confirmar Pedido" |
| Login | "Entrar" | "Iniciar Sessão" |
| Registo | "Criar Conta" | "Registar" |

---

## Implementação

### Checklist de Implementação

#### Fase 1: Setup Base
- [ ] Instalar Tailwind CSS v4.0
- [ ] Configurar `/styles/globals.css` com tokens de cores
- [ ] Instalar Lucide React para ícones
- [ ] Instalar sonner para notificações toast
- [ ] Configurar estrutura de pastas (`/components`, `/pages`, etc)

#### Fase 2: Componentes Base
- [ ] Criar componentes de botões (primário, secundário, outline, WhatsApp)
- [ ] Criar componente de input e forms
- [ ] Criar componente de card de produto
- [ ] Criar componente de badge e tags
- [ ] Criar componente de loading (spinner, skeleton)

#### Fase 3: Layout
- [ ] Implementar Header com navegação
- [ ] Implementar Footer
- [ ] Implementar Breadcrumb
- [ ] Implementar Container responsivo
- [ ] Implementar Grid de produtos

#### Fase 4: Páginas Principais
- [ ] Página inicial (Home)
- [ ] Página de listagem de produtos
- [ ] Página de detalhes do produto
- [ ] Página de carrinho
- [ ] Página de checkout

#### Fase 5: Funcionalidades
- [ ] Sistema de filtros
- [ ] Sistema de busca
- [ ] Sistema de avaliações
- [ ] Integração WhatsApp
- [ ] Sistema de comparação de produtos

#### Fase 6: Backend
- [ ] Configurar Supabase
- [ ] Criar tabelas no banco de dados
- [ ] Implementar rotas do servidor
- [ ] Integrar frontend com backend
- [ ] Implementar autenticação

#### Fase 7: Testes e Otimização
- [ ] Testar responsividade em diferentes dispositivos
- [ ] Otimizar performance (lazy loading, code splitting)
- [ ] Testar fluxos de compra completos
- [ ] Validar integração WhatsApp
- [ ] Revisar acessibilidade

### Recursos e Assets

**Imagens necessárias:**
- Logo KZSTORE (formato SVG ou PNG transparente)
- Imagens de produtos (alta qualidade, fundo branco, 1:1 aspect ratio)
- Ícones de categorias
- Banners promocionais (1920x600px para desktop, 800x800px para mobile)

**Conteúdo textual:**
- Descrições de produtos (mínimo 100 palavras)
- Especificações técnicas completas
- Políticas (envio, devolução, privacidade, termos)
- FAQs
- Textos de apoio (sobre nós, contacto)

---

## Notas Finais

### Boas Práticas

1. **Sempre usar as cores exatas** definidas no Design System
2. **Manter consistência** de espaçamento (múltiplos de 4px)
3. **Testar em dispositivos reais** (não apenas browser DevTools)
4. **Otimizar imagens** antes de fazer upload (WebP quando possível)
5. **Usar loading states** em todas as operações assíncronas
6. **Validar inputs** no frontend e backend
7. **Mensagens de erro claras** e em português correcto
8. **Acessibilidade**: alt text em imagens, labels em forms, contraste adequado

### Contacto Técnico

Para dúvidas sobre implementação deste Design System, contactar:
- WhatsApp KZSTORE: +244 931 054 015
- Email: (adicionar email se disponível)

---

**Documento criado para:** KZSTORE (KwanzaStore)  
**Versão:** 1.0  
**Última actualização:** 25 de Novembro de 2024  
**Status:** Final - Pronto para Implementação

---

## Anexo A: Código de Exemplo - Página de Produto Completa

```tsx
import React, { useState } from 'react';
import { 
  ShoppingCart, Heart, Share2, Star, MessageCircle, 
  ChevronRight, Package, Truck, CreditCard 
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const product = {
    id: 1,
    name: 'Kingston DDR4 32GB 2666MHz ECC Registered',
    category: 'Memória RAM',
    price: 75000,
    priceUSD: 85,
    stock: 15,
    images: ['/product1.jpg', '/product2.jpg', '/product3.jpg'],
    rating: 4.5,
    reviews: 28,
    description: 'Memória RAM Kingston de alta performance para servidores...',
    specs: {
      'Capacidade': '32GB',
      'Tipo': 'DDR4',
      'Velocidade': '2666MHz',
      'ECC': 'Sim',
      'Registered': 'Sim',
      'Voltagem': '1.2V',
      'Compatibilidade': 'Servidores Dell, HP, Lenovo'
    }
  };
  
  const handleAddToCart = () => {
    toast.success('Produto adicionado ao carrinho!');
  };
  
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto:\n\n${product.name}\nPreço: ${product.price} Kz\n\nGostaria de mais informações.`
    );
    window.open(`https://wa.me/244931054015?text=${message}`, '_blank');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#E31E24] rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">KZ</span>
              </div>
              <span className="font-bold text-xl text-gray-900">KZSTORE</span>
            </div>
            <button className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#E31E24] text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <a href="#" className="hover:text-[#E31E24]">Início</a>
          <ChevronRight className="w-4 h-4" />
          <a href="#" className="hover:text-[#E31E24]">Produtos</a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{product.category}</span>
        </nav>
      </div>
      
      {/* Conteúdo Principal */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-6">
          {/* Imagens */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square bg-gray-100 rounded border-2 overflow-hidden
                    ${selectedImage === idx ? 'border-[#E31E24]' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          </div>
          
          {/* Informações */}
          <div className="space-y-6">
            {/* Categoria */}
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              {product.category}
            </p>
            
            {/* Nome */}
            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
            
            {/* Avaliações */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(star => (
                  <Star 
                    key={star}
                    className={`w-5 h-5 ${star <= 4 ? 'fill-[#FDD835] text-[#FDD835]' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviews} avaliações)
              </span>
            </div>
            
            {/* Preço */}
            <div>
              <p className="text-4xl font-bold text-[#E31E24] mb-1">
                {product.price.toLocaleString('pt-AO')} Kz
              </p>
              <p className="text-sm text-gray-500">
                ~{product.priceUSD} USD
              </p>
            </div>
            
            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Em Stock
              </span>
              <span className="text-sm text-gray-600">
                {product.stock} unidades disponíveis
              </span>
            </div>
            
            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 text-center px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent outline-none"
                />
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Botões de Ação */}
            <div className="space-y-3">
              <button 
                onClick={handleAddToCart}
                className="w-full px-6 py-4 bg-[#E31E24] text-white rounded-lg hover:bg-[#C01A1F] transition-colors font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Adicionar ao Carrinho
              </button>
              
              <button 
                onClick={handleWhatsApp}
                className="w-full px-6 py-4 bg-[#25D366] text-white rounded-lg hover:bg-[#1DA851] transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contactar via WhatsApp
              </button>
              
              <div className="flex gap-3">
                <button className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  Favoritar
                </button>
                <button className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Partilhar
                </button>
              </div>
            </div>
            
            {/* Benefícios */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Package className="w-5 h-5 text-[#E31E24]" />
                <span>Produto original e verificado</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Truck className="w-5 h-5 text-[#E31E24]" />
                <span>Entrega grátis em Luanda acima de 100.000 Kz</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CreditCard className="w-5 h-5 text-[#E31E24]" />
                <span>Pagamento via Multicaixa Express ou Referência</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs - Descrição e Especificações */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-8">
              <button className="pb-4 border-b-2 border-[#E31E24] text-[#E31E24] font-medium">
                Descrição
              </button>
              <button className="pb-4 border-b-2 border-transparent text-gray-600 font-medium hover:text-gray-900">
                Especificações Técnicas
              </button>
              <button className="pb-4 border-b-2 border-transparent text-gray-600 font-medium hover:text-gray-900">
                Avaliações ({product.reviews})
              </button>
            </nav>
          </div>
          
          {/* Conteúdo da Tab */}
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">
              Especificações Técnicas
            </h3>
            
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700 w-1/2">{key}:</span>
                  <span className="text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

**FIM DO DOCUMENTO**
