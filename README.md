# 🛍️ KZSTORE - E-commerce Angola# Supabase CLI



E-commerce moderno e completo para o mercado angolano, com sistema de trade-in, B2B, cotações personalizadas e muito mais.[![Coverage Status](https://coveralls.io/repos/github/supabase/cli/badge.svg?branch=main)](https://coveralls.io/github/supabase/cli?branch=main) [![Bitbucket Pipelines](https://img.shields.io/bitbucket/pipelines/supabase-cli/setup-cli/master?style=flat-square&label=Bitbucket%20Canary)](https://bitbucket.org/supabase-cli/setup-cli/pipelines) [![Gitlab Pipeline Status](https://img.shields.io/gitlab/pipeline-status/sweatybridge%2Fsetup-cli?label=Gitlab%20Canary)

](https://gitlab.com/sweatybridge/setup-cli/-/pipelines)

## 🌟 Funcionalidades

[Supabase](https://supabase.io) is an open source Firebase alternative. We're building the features of Firebase using enterprise-grade open source tools.

### 🛒 E-commerce Completo

- Catálogo de produtos com busca e filtrosThis repository contains all the functionality for Supabase CLI.

- Carrinho de compras inteligente

- Checkout com múltiplas formas de pagamento- [x] Running Supabase locally

- Sistema de fidelidade com pontos- [x] Managing database migrations

- Flash sales e promoções- [x] Creating and deploying Supabase Functions

- Lista de desejos- [x] Generating types directly from your database schema

- [x] Making authenticated HTTP requests to [Management API](https://supabase.com/docs/reference/api/introduction)

### 📱 Trade-In System

- Avaliação de produtos usados## Getting started

- Upload de fotos (até 5 por produto)

- Sistema de créditos para usar em compras### Install the CLI

- Painel admin para gerenciar avaliações

Available via [NPM](https://www.npmjs.com) as dev dependency. To install:

### 🏢 B2B (Business to Business)

- Cadastro de empresas angolanas```bash

- Validação de NIF (9 dígitos)npm i supabase --save-dev

- Sistema de aprovação por admin```

- Descontos progressivos por tier

- Pedidos em volumeTo install the beta release channel:



### 💬 Cotações Personalizadas```bash

- Solicitação de orçamento customizadonpm i supabase@beta --save-dev

- Sistema de itens dinâmico```

- Painel admin para responder cotações

When installing with yarn 4, you need to disable experimental fetch with the following nodejs config.

### 👥 Gestão de Usuários

- Autenticação completa (login/cadastro)```

- Perfis de usuárioNODE_OPTIONS=--no-experimental-fetch yarn add supabase

- Histórico de pedidos```

- Meus alertas de preço

> **Note**

### 📊 Painel AdministrativoFor Bun versions below v1.0.17, you must add `supabase` as a [trusted dependency](https://bun.sh/guides/install/trusted) before running `bun add -D supabase`.

- Dashboard com estatísticas

- Gerenciamento de produtos<details>

- Gestão de pedidos  <summary><b>macOS</b></summary>

- Avaliação de trade-ins

- Aprovação de empresas B2B  Available via [Homebrew](https://brew.sh). To install:

- Gerenciamento de afiliados

- Campanhas de email  ```sh

- Pré-vendas e listas de espera  brew install supabase/tap/supabase

  ```

### 🎯 Outros Recursos

- Sistema de afiliados  To install the beta release channel:

- Email marketing  

- Alertas de preço  ```sh

- Lista de espera para produtos  brew install supabase/tap/supabase-beta

- PWA (Progressive Web App)  brew link --overwrite supabase-beta

- Design responsivo  ```

- Tema claro otimizado  

  To upgrade:

## 🇦🇴 Localização Angola

  ```sh

- ✅ Moeda: Kwanzas (Kz)  brew upgrade supabase

- ✅ 18 províncias angolanas  ```

- ✅ Formato NIF (9 dígitos)</details>

- ✅ Telefone: +244

- ✅ Idioma: Português<details>

  <summary><b>Windows</b></summary>

## 🛠️ Tecnologias

  Available via [Scoop](https://scoop.sh). To install:

### Frontend

- **React 18** - UI Framework  ```powershell

- **TypeScript** - Type safety  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git

- **Vite** - Build tool & dev server  scoop install supabase

- **Tailwind CSS** - Styling  ```

- **Radix UI** - Component primitives

- **Lucide React** - Icons  To upgrade:

- **React Hook Form** - Formulários

- **Zustand** - State management  ```powershell

- **React Hot Toast** - Notificações  scoop update supabase

  ```

### Backend</details>

- **Supabase** - Backend as a Service

  - PostgreSQL Database<details>

  - Authentication  <summary><b>Linux</b></summary>

  - Storage (imagens)

  - Row Level Security (RLS)  Available via [Homebrew](https://brew.sh) and Linux packages.

  - Edge Functions

  #### via Homebrew

## 📦 Instalação

  To install:

### Pré-requisitos

- Node.js 18+   ```sh

- npm ou yarn  brew install supabase/tap/supabase

- Conta no Supabase  ```



### Passo a Passo  To upgrade:



1. **Clone o repositório:**  ```sh

```bash  brew upgrade supabase

git clone https://github.com/seu-usuario/kzstore.git  ```

cd kzstore

```  #### via Linux packages



2. **Instale as dependências:**  Linux packages are provided in [Releases](https://github.com/supabase/cli/releases). To install, download the `.apk`/`.deb`/`.rpm`/`.pkg.tar.zst` file depending on your package manager and run the respective commands.

```bash

npm install  ```sh

```  sudo apk add --allow-untrusted <...>.apk

  ```

3. **Configure as variáveis de ambiente:**

```bash  ```sh

# Copie o arquivo de exemplo  sudo dpkg -i <...>.deb

cp .env.example .env  ```



# Edite o .env com suas credenciais Supabase  ```sh

# VITE_SUPABASE_PROJECT_ID=seu_project_id  sudo rpm -i <...>.rpm

# VITE_SUPABASE_ANON_KEY=sua_anon_key  ```

```

  ```sh

4. **Aplique as migrações do banco:**  sudo pacman -U <...>.pkg.tar.zst

```bash  ```

# Instale a Supabase CLI</details>

npm install -g supabase

<details>

# Login  <summary><b>Other Platforms</b></summary>

supabase login

  You can also install the CLI via [go modules](https://go.dev/ref/mod#go-install) without the help of package managers.

# Vincule ao seu projeto

supabase link --project-ref SEU_PROJECT_REF  ```sh

  go install github.com/supabase/cli@latest

# Aplique as migrações  ```

supabase db push

```  Add a symlink to the binary in `$PATH` for easier access:



5. **Configure os buckets de storage:**  ```sh

No dashboard do Supabase, crie os buckets:  ln -s "$(go env GOPATH)/bin/cli" /usr/bin/supabase

- `products` (público)  ```

- `trade-in` (público)

- `ad-images` (público)  This works on other non-standard Linux distros.

</details>

6. **Inicie o servidor de desenvolvimento:**

```bash<details>

npm run dev  <summary><b>Community Maintained Packages</b></summary>

```

  Available via [pkgx](https://pkgx.sh/). Package script [here](https://github.com/pkgxdev/pantry/blob/main/projects/supabase.com/cli/package.yml).

Acesse: http://localhost:5173  To install in your working directory:



## 🚀 Build e Deploy  ```bash

  pkgx install supabase

### Build de Produção  ```

```bash

npm run build  Available via [Nixpkgs](https://nixos.org/). Package script [here](https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/tools/supabase-cli/default.nix).

```</details>



Os arquivos estarão em `/build`### Run the CLI



### Deploy```bash

supabase bootstrap

Veja o guia completo em [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)```



**Plataformas recomendadas:**Or using npx:

- ✅ Vercel (recomendado)

- ✅ Netlify```bash

- ✅ Cloudflare Pagesnpx supabase bootstrap

```

## 📁 Estrutura do Projeto

The bootstrap command will guide you through the process of setting up a Supabase project using one of the [starter](https://github.com/supabase-community/supabase-samples/blob/main/samples.json) templates.

```

kzstore/## Docs

├── src/

│   ├── components/         # Componentes ReactCommand & config reference can be found [here](https://supabase.com/docs/reference/cli/about).

│   │   ├── admin/         # Painel administrativo

│   │   ├── Header.tsx     # Cabeçalho## Breaking changes

│   │   ├── ProductCard.tsx

│   │   └── ...We follow semantic versioning for changes that directly impact CLI commands, flags, and configurations.

│   ├── hooks/             # Custom hooks

│   │   ├── useAuth.ts     # AutenticaçãoHowever, due to dependencies on other service images, we cannot guarantee that schema migrations, seed.sql, and generated types will always work for the same CLI major version. If you need such guarantees, we encourage you to pin a specific version of CLI in package.json.

│   │   └── useKZStore.ts  # State global

│   ├── utils/             # Utilitários## Developing

│   │   ├── supabase/      # Config Supabase

│   │   └── logger.ts      # Sistema de logsTo run from source:

│   ├── App.tsx            # Componente principal

│   └── main.tsx           # Entry point```sh

├── supabase/# Go >= 1.22

│   └── migrations/        # Migrações SQLgo run . help

├── public/                # Arquivos estáticos```

├── .env.example           # Exemplo de variáveis
├── vite.config.ts         # Config Vite
└── package.json
```

## 🗄️ Banco de Dados

### Tabelas Principais
- `products` - Produtos
- `orders` - Pedidos
- `customers` - Clientes
- `trade_in_requests` - Solicitações trade-in
- `trade_in_credits` - Créditos trade-in
- `business_accounts` - Contas B2B
- `custom_quotes` - Cotações personalizadas
- `pre_sales` - Pré-vendas
- `waiting_lists` - Listas de espera
- `affiliates` - Afiliados
- `price_alerts` - Alertas de preço
- `email_campaigns` - Campanhas de email

Total: 30+ tabelas

## 🔒 Segurança

- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Variáveis de ambiente para credenciais
- ✅ Validação de dados no frontend e backend
- ✅ Autenticação via Supabase Auth
- ✅ Storage com políticas de acesso

## 🧪 Testes

### Usuário Admin Padrão
```
Email: admin@kzstore.ao
Senha: admin123
```

### Fluxos para Testar
1. Compra completa (produto → carrinho → checkout)
2. Trade-in (envio → avaliação → crédito → uso)
3. B2B (cadastro → aprovação → compra com desconto)
4. Cotação personalizada

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview do build
npm run preview

# Limpar console.logs (PowerShell)
./scripts/remove-console-logs.ps1
```

## 📄 Licença

Este projeto está sob a licença MIT.

## 🐛 Problemas Conhecidos

Veja [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) para lista completa de verificações.

## 📞 Suporte

- **Issues:** [GitHub Issues](https://github.com/seu-usuario/kzstore/issues)
- **Documentação:** Veja DEPLOY_GUIDE.md

## 🎯 Roadmap

- [ ] Integração com gateway de pagamento angolano
- [ ] App mobile (React Native)
- [ ] Chatbot AI com Gemini
- [ ] Sistema de reviews e avaliações
- [ ] Multi-idioma (PT/EN)
- [ ] Dark mode
- [ ] Notificações push

## ✨ Créditos

Desenvolvido para o mercado angolano com ❤️

**Versão:** 1.0.0  
**Última atualização:** Novembro 2025
