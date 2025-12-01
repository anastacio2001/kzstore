# 🎨 Guia de Configuração da Página Inicial

## Funcionalidade Implementada

Agora você pode personalizar completamente o banner principal (Hero Section) da sua página inicial através do painel administrativo!

## Como Usar

### 1️⃣ Acessar as Configurações

1. Faça login no painel admin
2. Clique na aba **"Página Inicial"** (ícone de estrela ✨)
3. Você verá o gerenciador de configurações do Hero Banner

### 2️⃣ Personalizar o Conteúdo

Você pode editar:

#### Textos
- **Título Principal**: Primeira linha do texto (ex: "Tecnologia de")
- **Subtítulo (Destaque)**: Segunda linha com cor destacada (ex: "Ponta em Angola")
- **Descrição**: Parágrafo explicativo do seu negócio
- **Botão Principal**: Texto e link do botão vermelho
- **Botão Secundário**: Texto e link do botão verde

#### Imagem de Fundo
Você tem 3 opções:

**Opção 1: URL Externa**
- Cole a URL de qualquer imagem da internet no campo "URL da Imagem"
- Ideal para usar imagens do Unsplash ou outros sites

**Opção 2: Upload de Arquivo**
- Clique em "Escolher arquivo"
- Selecione uma imagem do seu computador (JPG, PNG, WebP)
- Clique no botão "Upload"
- A imagem será enviada para o servidor

**Opção 3: Imagens Sugeridas**
- Clique em uma das 4 miniaturas sugeridas
- São imagens profissionais do Unsplash

### 3️⃣ Visualizar Preview

- A seção "Preview da Página Inicial" mostra como ficará o banner
- Todas as alterações aparecem em tempo real no preview
- Você vê exatamente como os visitantes verão o site

### 4️⃣ Salvar Alterações

1. Clique no botão **"Salvar Alterações"** (canto superior direito)
2. As configurações são salvas no navegador
3. A página inicial é automaticamente atualizada
4. Visite a home do site para ver as mudanças aplicadas

### 5️⃣ Restaurar Padrão

- Se quiser voltar às configurações originais
- Clique em **"Restaurar Padrão"**
- Confirme a ação

## Recursos Avançados

### Upload de Imagens

**Limitações:**
- Tamanho máximo: 5MB
- Formatos aceitos: JPG, PNG, WebP
- As imagens ficam salvas em: `http://localhost:3001/uploads/`

**Dica:** Para melhor performance, use imagens:
- Resolução: 1920x1080px ou 1600x900px
- Formato: WebP (menor tamanho)
- Otimizadas (use TinyPNG antes de fazer upload)

### Links dos Botões

**Botão Principal** (Vermelho):
- Padrão: `/produtos` (leva para página de produtos)
- Você pode usar:
  - Rotas internas: `/produtos`, `/contato`, `/sobre`
  - Links externos: `https://exemplo.com`
  - Âncoras: `#promocoes`

**Botão Secundário** (Verde):
- Padrão: Link do WhatsApp
- Ideal para contato direto
- Formato: `https://wa.me/244931054015`

## Como Funciona Tecnicamente

### Frontend (HomePage.tsx)
- Carrega as configurações do `localStorage`
- Atualiza automaticamente quando admin salva
- Usa evento customizado `heroSettingsUpdated`

### Backend (server.ts)
- Endpoint: `POST /api/upload`
- Aceita upload de imagens via multipart/form-data
- Salva em `/uploads`
- Retorna URL da imagem

### Armazenamento
- Configurações salvas em: `localStorage.heroSettings`
- Imagens salvas em: `public/uploads/`

## Exemplos de Uso

### Promoção de Natal
```
Título: Natal KZSTORE 2024
Subtítulo: 50% OFF em Tudo
Descrição: Promoção válida até 31/12. Aproveite os melhores preços do ano!
Botão 1: Ver Ofertas → /produtos?promocao=natal
Botão 2: Falar com Vendedor → WhatsApp
Imagem: Banner de Natal com cores festivas
```

### Lançamento de Produto
```
Título: Novo iPhone 15
Subtítulo: Já Disponível em Angola
Descrição: Chegaram os novos iPhone 15. Garanta o seu com entrega em 24h!
Botão 1: Comprar Agora → /produtos/iphone-15
Botão 2: Saber Mais → /iphone-15
Imagem: iPhone 15 em fundo escuro
```

### Black Friday
```
Título: Black Friday
Subtítulo: Até 70% de Desconto
Descrição: Os maiores descontos do ano em eletrônicos. Ofertas por tempo limitado!
Botão 1: Ver Todas as Ofertas → /black-friday
Botão 2: Alertas WhatsApp → WhatsApp
Imagem: Banner escuro com preços riscados
```

## Dicas de Design

### Cores
- Use imagens com tons escuros para texto branco ficar legível
- O overlay escuro (70% de opacidade) ajuda na legibilidade
- Mantenha contraste entre texto e fundo

### Texto
- Título: Curto e impactante (2-4 palavras)
- Subtítulo: O destaque principal (2-5 palavras)
- Descrição: 1-2 frases explicativas
- Botões: Verbos de ação claros

### Imagens
- Prefira imagens horizontais (landscape)
- Evite imagens com muito texto
- Use fotos de produtos ou tecnologia
- Mantenha qualidade profissional

## Solução de Problemas

### Imagem não aparece
- Verifique se a URL está correta
- Teste a URL em outra aba do navegador
- Se for upload local, verifique se o servidor está rodando

### Alterações não salvam
- Verifique o console do navegador (F12)
- Limpe o cache: `localStorage.clear()`
- Recarregue a página admin

### Preview diferente do site
- Limpe o cache do navegador (Ctrl+Shift+R)
- Verifique se salvou as alterações
- Aguarde alguns segundos para propagação

### Upload falha
- Verifique tamanho do arquivo (máx 5MB)
- Confirme formato aceito (JPG, PNG, WebP)
- Verifique se o servidor está rodando
- Veja logs do console para erros

## Próximos Passos

Funcionalidades futuras planejadas:
- [ ] Salvar configurações no banco de dados
- [ ] Histórico de versões do banner
- [ ] Agendamento de banners (ex: mudar automaticamente em promoções)
- [ ] A/B testing de diferentes versões
- [ ] Biblioteca de imagens pré-cadastradas
- [ ] Editor visual de texto (negrito, cores, etc)
- [ ] Múltiplos slides (carrossel)
- [ ] Animações customizáveis

## Suporte

Se tiver dúvidas ou problemas:
1. Verifique este guia primeiro
2. Consulte os logs do console (F12)
3. Teste em modo incógnito
4. Contate o desenvolvedor

---

**Última atualização:** 26/11/2024
**Versão:** 1.0.0
