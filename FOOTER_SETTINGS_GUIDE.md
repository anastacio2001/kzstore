# 📄 Guia Completo: Gestão do Footer e Páginas Institucionais

## ✨ Funcionalidade Implementada

Sistema completo para gerenciar **todas** as informações do footer e criar/editar páginas institucionais dinamicamente através do painel administrativo.

## 🎯 O Que Você Pode Fazer

### 1. **Informações Gerais da Empresa**
- Editar nome da empresa
- Modificar descrição da empresa
- Personalizar texto de copyright
- Gerenciar métodos de pagamento aceitos

### 2. **Informações de Contato**
- Endereço completo
- Telefone de contato
- Email institucional
- Horário de atendimento

### 3. **Redes Sociais**
- Adicionar/Editar/Excluir redes sociais
- Personalizar ícone e URL de cada rede
- Suporte ilimitado de redes

### 4. **Links Rápidos**
- Criar links customizados no footer
- Editar títulos e URLs
- Reordenar links
- Remover links desnecessários

### 5. **Páginas Institucionais**
- Criar páginas completas (Sobre Nós, Termos, Privacidade, etc.)
- Editor de conteúdo HTML/Markdown
- URLs amigáveis (slugs personalizados)
- Visualização automática no site

## 📝 Como Usar

### Acessar o Gerenciador

1. Faça login no painel admin
2. Clique na aba **"Footer"** na barra de navegação
3. Você verá 5 abas diferentes:
   - **Informações Gerais**
   - **Contato**
   - **Redes Sociais**
   - **Links Rápidos**
   - **Páginas**

### Aba: Informações Gerais

**Campos disponíveis:**

1. **Nome da Empresa**
   - Aparece no logo do footer
   - Padrão: "KZSTORE"

2. **Descrição da Empresa**
   - Texto abaixo do logo
   - Máximo recomendado: 2-3 linhas
   - Exemplo: "A maior loja online de produtos eletrônicos..."

3. **Texto de Copyright**
   - Barra inferior do site
   - Variáveis disponíveis: {currentYear} para ano atual
   - Exemplo: "© 2025 KZSTORE. Todos os direitos reservados."

4. **Métodos de Pagamento**
   - Lista de formas de pagamento
   - Clique em "+ Adicionar Método" para novos
   - Clique no ícone de lixeira para remover
   - Exemplos: "Multicaixa Express", "TPA", "Transferência"

### Aba: Contato

**Campos disponíveis:**

1. **📍 Endereço**
   - Endereço físico da loja/empresa
   - Aparece com ícone de localização
   - Exemplo: "Sector D, Quarteirão 7, Av. 21 de Janeiro, Luanda Angola"

2. **📞 Telefone**
   - Número de contato principal
   - Formato: +244 XXX XXX XXX
   - Clicável (abre discador no celular)

3. **✉️ Email**
   - Email institucional
   - Clicável (abre cliente de email)
   - Exemplo: contato@kzstore.ao

4. **🕐 Horário de Atendimento**
   - Dias e horários de funcionamento
   - Suporta múltiplas linhas
   - Exemplo:
     ```
     Segunda - Sábado
     8:00 - 17:00
     ```

### Aba: Redes Sociais

**Gerenciar redes sociais:**

**Adicionar nova rede:**
1. Clique em "+ Adicionar Rede"
2. Preencha:
   - **Ícone**: Emoji representativo (📘, 📷, 🐦, 💼)
   - **Plataforma**: Nome da rede (Facebook, Instagram, etc.)
   - **URL**: Link completo para seu perfil
3. Clique em 💾 Salvar

**Editar rede existente:**
1. Clique no ícone ✏️ ao lado da rede
2. Modifique os campos
3. Clique em 💾 Salvar

**Excluir rede:**
1. Clique no ícone 🗑️
2. Confirme a exclusão

**Redes padrão:**
- 📘 Facebook
- 📷 Instagram
- 🐦 Twitter
- 💼 LinkedIn

### Aba: Links Rápidos

**Gerenciar links de navegação:**

**Adicionar novo link:**
1. Clique em "+ Adicionar Link"
2. Preencha:
   - **Título**: Nome que aparece no footer
   - **URL**: Caminho da página (ex: /sobre, /produtos)
3. Clique em 💾 Salvar

**Editar link:**
1. Clique no ícone ✏️
2. Modifique título ou URL
3. Salve

**Excluir link:**
1. Clique no ícone 🗑️
2. Confirme

**Links padrão:**
- Sobre Nós → /sobre
- Produtos → /produtos
- Promoções → /promocoes
- Blog → /blog
- Carreiras → /carreiras

### Aba: Páginas

**Criar páginas institucionais completas:**

**Ver páginas existentes:**
- Grade com todas as páginas criadas
- Mostra título, slug e preview do conteúdo
- Botões para editar ou excluir cada página

**Adicionar nova página:**
1. Clique em "+ Adicionar Página"
2. Preencha o formulário que aparece:

   **a) Título da Página**
   - Nome da página (ex: "Política de Privacidade")
   - Aparece no menu do footer e no topo da página

   **b) Slug (URL)**
   - URL amigável da página
   - Apenas letras minúsculas, números e hífens
   - Gerado automaticamente a partir do título
   - Exemplo: "politica-de-privacidade"
   - A página ficará acessível em: `/politica-de-privacidade`

   **c) Conteúdo da Página**
   - Editor de texto grande (15 linhas)
   - Suporta **HTML** e **Markdown**
   - Use formatação rica

3. Clique em "💾 Salvar Página"

**Editar página existente:**
1. Clique no ícone ✏️ no card da página
2. Formulário de edição aparece abaixo
3. Modifique os campos desejados
4. Clique em "💾 Salvar Página"

**Excluir página:**
1. Clique no ícone 🗑️
2. Confirme a exclusão

**Páginas padrão:**
- Central de Ajuda
- Política de Devolução
- Garantia
- Termos de Uso
- Política de Privacidade

## 📄 Criando Conteúdo de Páginas

### Exemplos de Formatação

**HTML Básico:**
```html
<h1>Título Principal</h1>
<p>Este é um parágrafo de texto.</p>

<h2>Subtítulo</h2>
<p>Outro parágrafo com <strong>negrito</strong> e <em>itálico</em>.</p>

<ul>
  <li>Item de lista 1</li>
  <li>Item de lista 2</li>
  <li>Item de lista 3</li>
</ul>
```

**Markdown Simples:**
```markdown
# Título Principal

Este é um parágrafo de texto.

## Subtítulo

Outro parágrafo com **negrito** e *itálico*.

- Item de lista 1
- Item de lista 2
- Item de lista 3
```

### Template: Política de Privacidade

```html
<h1>Política de Privacidade</h1>

<p>Última atualização: 26 de novembro de 2025</p>

<h2>1. Informações que Coletamos</h2>
<p>A KZSTORE coleta as seguintes informações:</p>
<ul>
  <li>Nome completo</li>
  <li>Endereço de email</li>
  <li>Número de telefone</li>
  <li>Endereço de entrega</li>
</ul>

<h2>2. Como Usamos Suas Informações</h2>
<p>Usamos suas informações para:</p>
<ul>
  <li>Processar seus pedidos</li>
  <li>Enviar atualizações sobre entregas</li>
  <li>Melhorar nossos serviços</li>
</ul>

<h2>3. Segurança</h2>
<p>Seus dados são protegidos com criptografia de ponta a ponta.</p>

<h2>4. Contato</h2>
<p>Para dúvidas, entre em contato: kzstoregeral@gmail.com</p>
```

### Template: Termos de Uso

```html
<h1>Termos de Uso</h1>

<p>Bem-vindo à KZSTORE. Ao usar nosso site, você concorda com estes termos.</p>

<h2>1. Uso do Site</h2>
<p>Você pode usar nosso site para:</p>
<ul>
  <li>Navegar e pesquisar produtos</li>
  <li>Fazer compras online</li>
  <li>Criar uma conta de usuário</li>
</ul>

<h2>2. Proibições</h2>
<p>É proibido:</p>
<ul>
  <li>Usar o site para fins ilegais</li>
  <li>Tentar hackear ou comprometer a segurança</li>
  <li>Fazer spam ou uso abusivo</li>
</ul>

<h2>3. Produtos e Preços</h2>
<p>Todos os preços estão sujeitos a alteração sem aviso prévio.</p>

<h2>4. Entregas</h2>
<p>Fazemos entregas em toda Angola em até 48 horas úteis.</p>
```

### Template: Política de Devolução

```html
<h1>Política de Devolução</h1>

<h2>Prazo de Devolução</h2>
<p>Você tem até <strong>30 dias</strong> após receber o produto para solicitar devolução.</p>

<h2>Condições para Devolução</h2>
<ul>
  <li>Produto sem uso</li>
  <li>Embalagem original intacta</li>
  <li>Todos os acessórios incluídos</li>
  <li>Nota fiscal</li>
</ul>

<h2>Como Devolver</h2>
<ol>
  <li>Entre em contato conosco via WhatsApp: +244 931 054 015</li>
  <li>Informe o número do pedido</li>
  <li>Aguarde autorização</li>
  <li>Envie o produto para nosso endereço</li>
</ol>

<h2>Reembolso</h2>
<p>O reembolso será processado em até 7 dias úteis após recebermos o produto.</p>

<h2>Produtos Não Reembolsáveis</h2>
<ul>
  <li>Software aberto ou ativado</li>
  <li>Produtos personalizados</li>
  <li>Produtos danificados por mau uso</li>
</ul>
```

## 🔄 Salvar e Aplicar Alterações

**Importante:** As alterações são salvas individualmente em cada aba, MAS você precisa clicar no botão **"Salvar Todas Alterações"** no topo da página para aplicar ao site.

**Fluxo de trabalho:**
1. Faça suas alterações em várias abas
2. Clique em "💾 Salvar Todas Alterações" (topo)
3. Aguarde confirmação
4. Vá para o site e recarregue a página
5. Verifique as mudanças no footer

## 🌐 Visualizar Páginas Criadas

**No site público:**
- As páginas criadas ficam acessíveis em: `https://seusite.com/{slug}`
- Exemplo: `https://seusite.com/privacidade`

**No footer:**
- Páginas aparecem automaticamente na seção "Atendimento"
- Links clicáveis
- Redirecionam para a página completa

**Layout da página:**
- Header vermelho com título
- Botão "Voltar"
- Conteúdo formatado em card branco
- Rodapé completo

## ⚙️ Como Funciona Tecnicamente

### Armazenamento
```javascript
// Salvo em localStorage
{
  companyName: "KZSTORE",
  companyDescription: "...",
  contactInfo: { address, phone, email, workingHours },
  socialLinks: [...],
  quickLinks: [...],
  footerPages: [...],
  copyrightText: "...",
  paymentMethods: [...]
}
```

### Eventos Customizados
```javascript
// Quando admin salva configurações
window.dispatchEvent(new CustomEvent('footerSettingsUpdated', { 
  detail: settings 
}));

// Footer escuta e atualiza
window.addEventListener('footerSettingsUpdated', (event) => {
  setSettings(event.detail);
});
```

### Sincronização
```
Admin edita → Salva no localStorage → Dispara evento
                                          ↓
                                    Footer escuta
                                          ↓
                                   Atualiza visualmente
                                          ↓
                                   Usuário vê mudanças
```

## 📱 Componentes Atualizados

### Footer.tsx
- Agora carrega configurações dinâmicas
- Atualiza em tempo real
- Suporta redes sociais ilimitadas
- Links e páginas customizáveis
- Métodos de pagamento dinâmicos

### FooterPageRenderer.tsx
- Componente novo para renderizar páginas
- Layout profissional
- Suporte a HTML/Markdown
- Página 404 customizada
- Breadcrumb de navegação

## 🎨 Estilos Aplicados

**Páginas institucionais usam:**
- Tipografia: `prose prose-lg`
- Headers: Gradiente vermelho
- Cards: Fundo branco com sombra
- Botões: Estilo KZSTORE padrão
- Responsivo: Mobile-first

## 🧪 Como Testar

### Teste 1: Editar Informações Gerais
1. Admin → Footer → Informações Gerais
2. Mude "Nome da Empresa" para "KZSTORE PRO"
3. Salve todas alterações
4. Vá para o site
5. Veja o nome no footer mudou

### Teste 2: Adicionar Rede Social
1. Admin → Footer → Redes Sociais
2. Clique "+ Adicionar Rede"
3. Ícone: 📱, Plataforma: "TikTok", URL: "https://tiktok.com/@kzstore"
4. Salve
5. Salve todas alterações
6. Veja novo ícone no footer

### Teste 3: Criar Página Institucional
1. Admin → Footer → Páginas
2. Clique "+ Adicionar Página"
3. Título: "Sobre Nós"
4. Slug: "sobre-nos"
5. Conteúdo:
   ```html
   <h1>Sobre a KZSTORE</h1>
   <p>Somos a maior loja de eletrônicos de Angola!</p>
   ```
6. Salve página
7. Salve todas alterações
8. Acesse: `/sobre-nos`
9. Veja a página renderizada

### Teste 4: Editar Horário
1. Admin → Footer → Contato
2. Modifique "Horário de Atendimento":
   ```
   Segunda - Sexta
   9:00 - 18:00
   Sábados
   9:00 - 13:00
   ```
3. Salve todas alterações
4. Veja no footer

## 🔐 Segurança

**Sanitização de HTML:**
- Use `dangerouslySetInnerHTML` com cuidado
- Recomendado: Implementar biblioteca de sanitização
- Evite aceitar scripts de usuários não confiáveis

**Sugestão de melhoria futura:**
```typescript
import DOMPurify from 'dompurify';

<div
  dangerouslySetInnerHTML={{ 
    __html: DOMPurify.sanitize(page.content) 
  }}
/>
```

## 📈 Métricas e Analytics

**Futuro: Adicionar tracking:**
- Quantas vezes cada página foi visualizada
- Links mais clicados no footer
- Tempo médio na página
- Taxa de conversão por página

## 🚀 Melhorias Futuras

- [ ] Editor WYSIWYG (What You See Is What You Get)
- [ ] Templates prontos de páginas
- [ ] Versionamento de conteúdo
- [ ] Preview antes de publicar
- [ ] SEO: Meta tags customizadas por página
- [ ] Migração para banco de dados
- [ ] API REST para gerenciar remotamente
- [ ] Multilíngue (PT, EN, FR)
- [ ] Agendamento de mudanças
- [ ] Backup automático de configurações

## 🐛 Solução de Problemas

### Footer não atualiza
- Limpe o cache do navegador (Ctrl+Shift+R)
- Verifique se clicou em "Salvar Todas Alterações"
- Veja console (F12) por erros

### Página não aparece
- Confirme que salvou a página
- Verifique se o slug está correto
- Teste acessando diretamente: `/seu-slug`

### Conteúdo não formatado
- Verifique tags HTML estão fechadas
- Use preview de HTML online antes
- Teste Markdown converter online

### Links não funcionam
- URLs devem começar com `/` ou `http`
- Verifique se a página destino existe
- Teste o link manualmente

## 💡 Dicas Profissionais

1. **Mantenha URLs curtas**: `/sobre` melhor que `/sobre-nos-empresa`
2. **Use HTML semântico**: `<h1>`, `<h2>`, `<p>`, `<ul>`
3. **Seja consistente**: Mesmo estilo em todas as páginas
4. **Atualize regularmente**: Especialmente políticas legais
5. **Backup**: Copie as configurações periodicamente
6. **SEO**: Use palavras-chave relevantes
7. **Acessibilidade**: Use alt text em imagens
8. **Mobile**: Teste em dispositivos móveis

## 📚 Recursos Adicionais

**Aprender HTML:**
- [MDN HTML Basics](https://developer.mozilla.org/pt-BR/docs/Learn/HTML)
- [W3Schools HTML](https://www.w3schools.com/html/)

**Aprender Markdown:**
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Markdown](https://guides.github.com/features/mastering-markdown/)

**Ferramentas Úteis:**
- [HTML Cleaner](https://html-cleaner.com/)
- [Markdown to HTML](https://markdowntohtml.com/)
- [HTML Validator](https://validator.w3.org/)

---

**Status:** ✅ Implementado e Funcional  
**Última atualização:** 26/11/2024  
**Versão:** 1.0.0  
**Autor:** GitHub Copilot
