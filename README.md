# NexEdu - Tech Challenge Fase 5

Plataforma multiplataforma para gestão educacional desenvolvida como parte do Tech Challenge - Fase 5 (FIAP). Inclui aplicação mobile (React Native) e web (Next.js), com suporte a turmas, frequência, mensagens e múltiplos papéis de usuário.

## 🚀 Visão Geral

O NexEdu é uma plataforma completa que oferece:

- **📱 Aplicação Mobile**: Desenvolvida em React Native/Expo com Material Design 3
  - Suporte para Android, iOS e Web via Expo
  - Interface nativa e responsiva
  - Dark mode com tema automático

- **🌐 Aplicação Web**: Desenvolvida em Next.js 14 com shadcn/ui
  - Interface moderna e acessível
  - Server-side rendering (SSR)
  - Otimizada para SEO

- **🔐 Backend REST API**: Node.js/Express com PostgreSQL
  - Autenticação JWT
  - Controle de acesso baseado em roles (Professor/Aluno)
  - Documentação de endpoints

### Arquitetura da Plataforma

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXEDU PLATFORM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │   Mobile App │         │   Web App    │                │
│  │              │         │              │                │
│  │ React Native │         │   Next.js    │                │
│  │    + Expo    │         │  + shadcn/ui │                │
│  │              │         │              │                │
│  │  Port: 8081  │         │  Port: 3001  │                │
│  └──────┬───────┘         └──────┬───────┘                │
│         │                        │                         │
│         └────────────┬───────────┘                         │
│                      │                                     │
│                      ▼                                     │
│            ┌─────────────────┐                            │
│            │   REST API      │                            │
│            │                 │                            │
│            │  Node.js        │                            │
│            │  + Express      │                            │
│            │  + JWT Auth     │                            │
│            │                 │                            │
│            │  Port: 3000     │                            │
│            └────────┬────────┘                            │
│                     │                                     │
│                     ▼                                     │
│            ┌─────────────────┐                            │
│            │   PostgreSQL    │                            │
│            │                 │                            │
│            │  Port: 5433     │                            │
│            └─────────────────┘                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Tecnologias

### Frontend Mobile (React Native)
- **React Native** 0.81.5 com Expo 54.0.30
- **TypeScript** 5.9.2
- **React Native Paper** 5.x - Material Design 3 UI Library
- **React Navigation** 7.x (Stack + Bottom Tabs Navigator)
- **React Native Reanimated** 3.x - Animações e transições
- **React Native Vector Icons** - Ícones Material Community
- **Axios** 1.13.2 para requisições HTTP
- **AsyncStorage** para persistência de token e preferências
- **Context API** para gerenciamento de estado global (Auth, Theme, Snackbar)

### Frontend Web (Next.js)
- **Next.js** 14.2.33 (App Router)
- **TypeScript** 5.x
- **shadcn/ui** - Componentes UI baseados em Radix UI
- **Tailwind CSS** 3.4.1 - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis e não estilizados
- **Lucide React** - Ícones modernos
- **next-themes** - Suporte a dark mode
- **cmdk** - Command palette

### Backend
- **Node.js** com Express 5.1.0
- **TypeScript** 5.8.3
- **PostgreSQL** (banco de dados)
- **Prisma ORM** 6.16.3
- **JWT** (jsonwebtoken 9.0.2) para autenticação
- **bcrypt** 6.0.0 para hash de senhas
- **Docker & Docker Compose** para containerização

## Design System & UI/UX

A aplicação foi completamente reformulada seguindo os princípios do **Material Design 3**, oferecendo uma experiência moderna, profissional e consistente.

### Design System Implementado
- **Material Design 3** via React Native Paper
- **Paleta de cores NexEdu**: Azul violeta (#7C3AED) como cor primária
- **Sistema de tokens**: Cores, espaçamentos, tipografia e elevações padronizados
- **Componentes reutilizáveis**: 15+ componentes UI e compartilhados
- **Responsividade**: Layout adaptativo para diferentes tamanhos de tela (mobile, tablet)

### Recursos de UI/UX
- **Dark Mode** com toggle manual e modo automático (segue o sistema)
- **Animações suaves** em cards, transições e interações
- **Bottom Tab Navigation** modernizada com ícones Material
- **Snackbars** para feedback visual de ações (sucesso/erro)
- **Loading states** com skeletons animados
- **Empty states** ilustrativos para listas vazias
- **Diálogos de confirmação** com Material Design 3
- **Pull-to-refresh** estilizado em todas as listas
- **Ripple effects** nativos do Paper em botões e cards
- **Elevações e sombras** seguindo diretrizes MD3
- **Tipografia hierárquica** e legível
- **Cards elevados** para posts e usuários com animações

### Componentes Desenvolvidos
**UI Base (wrappers sobre React Native Paper):**
- Button, Card, Input, TextArea, Badge, Dialog, ConfirmDialog, Skeleton

**Componentes Compartilhados:**
- PostCard, UserCard, FilterChips, EmptyState, LoadingScreen

**Layouts:**
- ScreenLayout (wrapper padrão com SafeArea), HeaderBar

**Contexts:**
- AuthContext (autenticação), ThemeContext (dark/light mode), SnackbarContext (feedback)

**Hooks Customizados:**
- useTheme (acesso tipado ao tema), useResponsive (adaptação de layout)

## Funcionalidades Implementadas

### Autenticação & Perfil
- Login de professores e alunos com design moderno
- Autenticação JWT com token de 24 horas
- Persistência de sessão (auto-login)
- Tela de perfil do usuário com avatar e informações
- Configurações de tema (claro/escuro/automático)
- Logout com diálogo de confirmação
- Interceptor de token automático
- Logout automático em caso de token expirado (401)

### Gestão de Posts
- Listagem de posts em cards elevados com animações
- Visualização completa de posts com tipografia hierárquica
- Criar novo post com FAB (apenas Professor)
- Editar post com feedback via Snackbar (apenas Professor)
- Excluir post com diálogo de confirmação (apenas Professor)
- Pull-to-refresh estilizado
- Loading states com skeleton animado
- Empty state quando não há posts
- Busca por palavras-chave (API implementada)

### Gestão de Usuários
- Listagem de usuários em cards com avatar
- Filtros com chips: Todos | Professores | Alunos
- Contador de usuários por categoria
- Criar novo usuário com FAB (Professor ou Aluno)
- Editar usuário existente com validação
- Excluir usuário com diálogo de confirmação
- Proteção: não permite excluir a si mesmo
- Badge visual diferenciando roles (Professor/Aluno)
- Animações de entrada em cascata

### Controle de Acesso (RBAC)
- **Professor**: pode criar, editar e excluir posts e usuários
- **Aluno**: pode apenas visualizar posts
- Botões condicionais baseados no role do usuário
- Validação de permissões no backend

## Status Atual (100% Concluído)

### Frontend
- Estrutura base React Native + TypeScript
- Navegação com 7 telas (Login, Home, Post Detail, Create/Edit Post, User List, User Form)
- Context API para autenticação global (AuthContext)
- Integração completa com backend REST
- CRUD de posts integrado com API
- CRUD de usuários (Professores e Alunos)
- Cliente HTTP configurado com interceptores
- Tipos TypeScript completos (User, Post)
- Loading states em todas as operações
- Tratamento de erros com mensagens amigáveis
- FlatList com refresh
- Formulários com validação

### Backend
- Servidor Express.js rodando
- Autenticação JWT completa
- Banco de dados PostgreSQL + Prisma
- Endpoints REST implementados:
  - `POST /auth/login` - Login
  - `POST /auth/register` - Registro de usuário
  - `GET /posts` - Listar posts
  - `GET /posts/:id` - Buscar post por ID
  - `GET /posts/search?q=` - Buscar posts por palavra-chave
  - `POST /posts` - Criar post (apenas PROFESSOR)
  - `PUT /posts/:id` - Atualizar post (apenas PROFESSOR)
  - `DELETE /posts/:id` - Excluir post (apenas PROFESSOR)
  - `GET /users` - Listar usuários (apenas PROFESSOR)
  - `GET /users/:id` - Buscar usuário por ID (apenas PROFESSOR)
  - `PUT /users/:id` - Atualizar usuário (apenas PROFESSOR)
  - `DELETE /users/:id` - Excluir usuário (apenas PROFESSOR)
- Middleware de autenticação e autorização
- CORS configurado
- Validação de dados
- Hash de senhas com bcrypt
- Docker Compose para PostgreSQL

## Estrutura do Projeto

```
NexEduMobile4-main/
├── backend/                           # Backend Node.js
│   ├── src/
│   │   ├── index.ts                  # Servidor Express + rotas
│   │   ├── controllers/              # Controladores das rotas
│   │   ├── routes/                   # Definição das rotas
│   │   ├── utils/                    # Utilitários
│   │   └── middleware/
│   │       └── auth.ts               # Middleware de autenticação JWT
│   ├── prisma/
│   │   ├── schema.prisma             # Schema do banco de dados
│   │   └── migrations/               # Migrações do Prisma
│   ├── tests/                        # Arquivos de teste
│   │   ├── test-requests.http        # Requisições HTTP (REST Client)
│   │   └── teste.sh                  # Script de testes automatizados
│   ├── docker-compose.yml            # PostgreSQL containerizado
│   ├── Dockerfile                    # Imagem Docker do backend
│   └── package.json                  # Dependências do backend
│
├── frontend-web-shadcnui/            # Frontend Web Next.js
│   ├── app/                          # App Router (Next.js 14)
│   │   ├── layout.tsx                # Layout principal
│   │   ├── page.tsx                  # Página inicial
│   │   └── (auth)/                   # Rotas de autenticação
│   ├── components/
│   │   ├── ui/                       # Componentes shadcn/ui
│   │   └── shared/                   # Componentes compartilhados
│   ├── contexts/                     # Contexts (Auth, Theme)
│   ├── hooks/                        # Custom hooks
│   ├── lib/                          # Utilitários e configurações
│   ├── public/                       # Arquivos estáticos
│   ├── tailwind.config.ts            # Configuração Tailwind
│   ├── components.json               # Configuração shadcn/ui
│   └── package.json                  # Dependências do frontend web
│
├── src/                              # Frontend Mobile React Native
│   ├── components/            # Componentes reutilizáveis
│   │   ├── ui/               # Wrappers sobre React Native Paper
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── TextArea.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── ConfirmDialog.tsx  # Diálogo de confirmação
│   │   │   ├── Skeleton.tsx
│   │   │   └── index.ts
│   │   ├── shared/           # Componentes compostos
│   │   │   ├── PostCard.tsx
│   │   │   ├── UserCard.tsx
│   │   │   ├── FilterChips.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   └── index.ts
│   │   └── layouts/          # Layouts consistentes
│   │       ├── ScreenLayout.tsx
│   │       ├── HeaderBar.tsx
│   │       └── index.ts
│   ├── context/
│   │   ├── AuthContext.tsx   # Autenticação global
│   │   ├── ThemeContext.tsx  # Dark/Light mode
│   │   └── SnackbarContext.tsx # Feedback visual
│   ├── hooks/                # Hooks customizados
│   │   ├── useTheme.ts
│   │   └── useResponsive.ts
│   ├── navigation/
│   │   └── AppNavigator.tsx  # Stack + Bottom Tabs
│   ├── screens/              # 8 telas (todas refatoradas)
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── PostDetailScreen.tsx
│   │   ├── CreatePostScreen.tsx
│   │   ├── EditPostScreen.tsx
│   │   ├── UserListScreen.tsx
│   │   ├── UserFormScreen.tsx
│   │   └── ProfileScreen.tsx # Perfil do usuário
│   ├── services/
│   │   ├── api.ts            # Cliente Axios + interceptores
│   │   ├── authService.ts
│   │   ├── postService.ts
│   │   └── userService.ts
│   ├── types/
│   │   ├── User.ts
│   │   └── Post.ts
│   └── theme/                # Design System
│       ├── tokens.ts         # Design tokens (cores, spacing, etc)
│       ├── theme.ts          # Paper themes (light/dark)
│       └── animations.ts     # Constantes de animação
│
├── App.tsx                    # Root com múltiplos Providers
├── index.ts                   # Entry point
├── package.json               # Dependências
└── README.md                  # Documentação
```

## Arquitetura da Solução

### Frontend (React Native)
```
┌─────────────┐
│ LoginScreen │ → AuthContext + ThemeContext → AsyncStorage
└─────────────┘
       ↓
┌──────────────────────────────────────────────────────┐
│          Bottom Tab Navigation (MainTabs)             │
├──────────────────┬─────────────────┬──────────────────┤
│   Tab: Posts     │   Tab: Users    │   Tab: Profile   │
│                  │   (Professor)   │                  │
├──────────────────┼─────────────────┼──────────────────┤
│ • HomeScreen     │ • UserListScreen│ • ProfileScreen  │
│ • PostDetail     │ • UserForm      │   - Avatar       │
│ • CreatePost     │                 │   - Info         │
│ • EditPost       │                 │   - Dark Mode    │
│                  │                 │   - Logout       │
└──────────────────┴─────────────────┴──────────────────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                          ↓
            ┌──────────────────────────┐
            │   Design System Layer    │
            │  • Material Design 3     │
            │  • Theme (light/dark)    │
            │  • Snackbar Context      │
            │  • Reusable Components   │
            └──────────────────────────┘
```

### Backend (Node.js + Express)
```
Client Request
      ↓
[CORS Middleware]
      ↓
[JWT Auth Middleware] → Valida token
      ↓
[Role Middleware] → Valida PROFESSOR/ALUNO
      ↓
[Controllers] → Lógica de negócio
      ↓
[Prisma ORM] → Acesso ao banco
      ↓
[PostgreSQL Database]
```

## Como Executar

Este projeto possui três componentes principais:
1. **Backend** (Node.js/Express) - Porta 3000
2. **Frontend Mobile** (React Native/Expo) - Porta 8081 (Metro bundler)
3. **Frontend Web** (Next.js) - Porta 3001

### Pré-requisitos

- **Node.js** 20.x ou superior ⚠️ **OBRIGATÓRIO** (v18 não funciona!)
- **npm** 10.x ou superior
- **Docker** e **Docker Compose** (para o banco de dados)
- **Git**

**⚠️ IMPORTANTE**: React Native 0.81.5 e Expo 54 exigem Node.js 20+. Se você tiver Node 18 ou inferior, siga as instruções abaixo para atualizar.

#### Como Verificar Sua Versão do Node.js

```bash
node --version
```

Se aparecer `v18.x.x` ou inferior, você precisa atualizar.

#### Como Atualizar o Node.js (Ubuntu/WSL)

```bash
# Remover versão antiga
sudo apt remove nodejs

# Instalar Node.js 20.x usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar se instalou corretamente
node --version  # Deve mostrar v20.x.x
npm --version   # Deve mostrar 10.x.x
```

#### Como Atualizar o Node.js (Windows)

1. Baixe o instalador do Node.js 20 LTS: https://nodejs.org/
2. Execute o instalador e siga as instruções
3. Reinicie o terminal e verifique: `node --version`

#### Como Atualizar o Node.js (Mac)

```bash
# Usando Homebrew
brew update
brew upgrade node

# Ou baixe direto de: https://nodejs.org/
```

### Passo a Passo Completo

#### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd pos-fiap-fase4
```

#### 2. Configurar e Iniciar o Backend

```bash
# Navegar para a pasta do backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env a partir do exemplo
cp .env.example .env

# Iniciar o PostgreSQL com Docker
docker-compose up -d

# Aguardar alguns segundos para o banco iniciar (~10 segundos)

# Executar as migrações do Prisma
npx prisma migrate deploy

# Gerar o Prisma Client (IMPORTANTE!)
npx prisma generate

# (Opcional) Visualizar o banco de dados com Prisma Studio
npx prisma studio  # Abre em http://localhost:5555

# Iniciar o servidor backend
npm run dev
```

O backend estará rodando em **http://localhost:3000**

Verifique se está funcionando acessando: http://localhost:3000 (deve retornar "API NexEdu rodando!")

#### 3. Criar Usuário Professor Inicial

Como não há professores no banco inicialmente, você precisa criar um manualmente.

**Opção 1: Usando curl**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Professor Teste",
    "login": "prof",
    "password": "123456",
    "role": "PROFESSOR"
  }'
```

**Opção 2: Usando o arquivo `test-requests.http` no backend**
- Abra o arquivo `backend/tests/test-requests.http` em um editor compatível (VS Code + extensão REST Client)
- Execute a requisição de registro

**Opção 3: Via Prisma Studio**
- Abra `npx prisma studio`
- Navegue para a tabela `User`
- Adicione um novo usuário manualmente
- **IMPORTANTE**: A senha precisa ser hasheada. Use um gerador de bcrypt online com 10 rounds.

#### 4. (OPCIONAL) Configurar Frontend Mobile para Dispositivo Físico

**Por padrão, o app mobile está configurado para rodar no navegador (localhost)**.

Se quiser testar o **frontend mobile** em **celular físico ou emulador Android/iOS**, siga as instruções na seção [Configurar para Dispositivo Físico](#configurar-para-dispositivo-físico) no final deste README.

**Nota**: Esta configuração é apenas para o frontend mobile. O frontend web sempre rodará em `http://localhost:3001` e pode ser acessado de qualquer navegador na mesma máquina.

#### 5. Instalar Dependências do Frontend

```bash
# Voltar para a raiz do projeto
cd ..

# Instalar dependências
npm install
```

#### 6. Iniciar o Frontend Mobile

```bash
# Voltar para a raiz do projeto (se ainda estiver no backend)
cd ..

# Iniciar o Expo
npm start
```

Opções disponíveis:
- Pressione `w` - Abrir no navegador (Web)
- Pressione `a` - Abrir no emulador Android (requer configuração adicional)
- Pressione `i` - Abrir no simulador iOS (apenas macOS, requer configuração adicional)
- Escaneie o QR Code com o app Expo Go (requer configuração adicional)

**Comece testando no navegador (`w`)** - funciona imediatamente sem configuração adicional!

#### 7. (OPCIONAL) Iniciar o Frontend Web

```bash
# Navegar para a pasta do frontend web
cd frontend-web-shadcnui

# Instalar dependências (apenas na primeira vez)
npm install

# Criar arquivo .env.local
cp .env.local.example .env.local
# Edite .env.local e configure a URL da API:
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend web estará disponível em **http://localhost:3001**

**Comandos disponíveis:**
```bash
npm run dev       # Modo desenvolvimento (porta 3001)
npm run build     # Build para produção
npm run start     # Inicia servidor de produção
npm run lint      # Executa ESLint
```

---

## Passo a Passo para Teste

### 1. Login Inicial

1. Abra o app no dispositivo/emulador/navegador
2. Na tela de login, insira:
   - **Login**: `prof`
   - **Senha**: `123456`
3. Clique em **Entrar**

Você deve ser redirecionado para a tela **Home** (Posts Recentes)

### 2. Testar CRUD de Posts

#### Criar Post
1. Na tela Home, clique no botão **"+ Criar Novo Post"** (canto inferior direito)
2. Preencha:
   - **Título**: "Meu Primeiro Post"
   - **Conteúdo**: "Este é um post de teste criado pelo NexEdu"
3. Clique em **Salvar**

Você deve ver um alerta de sucesso e voltar para a Home com o novo post listado

#### Visualizar Post
1. Na lista de posts, clique em qualquer post
2. Verifique se o conteúdo completo e o autor são exibidos

Deve exibir título, conteúdo e "Por: Professor Teste"

#### Editar Post
1. Na lista de posts (tela Home), clique no botão **Editar** de algum post
2. Altere o título ou conteúdo
3. Clique em **Atualizar**

Deve exibir alerta de sucesso e atualizar o post na lista

#### Excluir Post
1. Na lista de posts, clique no botão **Excluir** de algum post
2. Confirme a exclusão no alerta
3. O post deve sumir da lista

Post removido com sucesso

### 3. Testar Gestão de Usuários (Apenas Professor)

#### Acessar Gestão de Usuários
1. Na tela Home, clique no botão **"👥 Usuários"** (canto inferior direito, acima do botão de criar post)

Você deve ser redirecionado para a tela de **Gerenciar Usuários**

#### Criar Aluno
1. Na tela de usuários, clique no botão **"+ Novo Usuário"** (canto inferior direito)
2. Preencha:
   - **Nome**: "João Aluno"
   - **Login**: "joao"
   - **Senha**: "123456"
   - **Tipo de Usuário**: Selecione **"👨‍🎓 Aluno"**
3. Clique em **Criar**

Deve exibir alerta de sucesso e voltar para a lista com o novo aluno

#### Criar Professor
1. Clique novamente em **"+ Novo Usuário"**
2. Preencha:
   - **Nome**: "Maria Professora"
   - **Login**: "maria"
   - **Senha**: "123456"
   - **Tipo de Usuário**: Selecione **"👨‍🏫 Professor"**
3. Clique em **Criar**

Novo professor adicionado à lista

#### Filtrar Usuários
1. Na tela de usuários, clique nos botões de filtro:
   - **Todos** - Mostra todos os usuários
   - **Professores** - Mostra apenas professores
   - **Alunos** - Mostra apenas alunos

Lista deve ser filtrada corretamente com contadores atualizados

#### Editar Usuário
1. Clique no botão **Editar** de algum usuário
2. Altere o nome ou login
3. Deixe a senha em branco (para manter a atual)
4. Clique em **Atualizar**

Usuário atualizado com sucesso

#### Excluir Usuário
1. Clique no botão **Excluir** de algum usuário
2. Confirme a exclusão

Usuário removido da lista

**Nota**: Você **não pode excluir a si mesmo** - o botão não aparece para o usuário logado.

### 4. Testar Controle de Acesso (Aluno vs Professor)

#### Login como Aluno
1. Faça logout clicando no botão **"Sair"** (canto inferior esquerdo)
2. Faça login com:
   - **Login**: `joao`
   - **Senha**: `123456`

Você deve ver a tela Home, mas:
- **Botão "Criar Post" não aparece**
- **Botão "Usuários" não aparece**
- **Botões "Editar" e "Excluir" nos posts não aparecem**
- **Pode visualizar posts normalmente**

#### Tentar Criar Post (Backend Protegido)
Mesmo que você tente acessar a rota manualmente, o backend retornará erro 403 (Forbidden).

### 5. Testar Persistência de Sessão

1. Faça login como professor (`prof` / `123456`)
2. Navegue pela aplicação
3. **Feche completamente o app**
4. **Reabra o app**

Você deve continuar logado e ir direto para a tela Home (sem precisar fazer login novamente)

### 6. Testar Logout

1. Na tela Home, clique no botão **"Sair"** (canto inferior esquerdo)

Deve voltar para a tela de Login e limpar a sessão

### 7. Testar Erros

#### Login Inválido
1. Tente fazer login com credenciais inválidas
   - **Login**: `usuario_invalido`
   - **Senha**: `senha_errada`

Deve exibir alerta: "Erro ao fazer login. Verifique suas credenciais."

#### Token Expirado (Simulação)
1. Faça login normalmente
2. No backend, altere a expiração do JWT para 1 segundo (arquivo `backend/src/index.ts`, linha ~53)
3. Aguarde 2 segundos
4. Tente criar um post ou acessar usuários

Deve fazer logout automático e voltar para tela de Login

---

## Endpoints da API (Resumo)

### Autenticação (Público)
```
POST /auth/register  - Registrar novo usuário
POST /auth/login     - Login (retorna token JWT)
```

### Posts (Autenticado)
```
GET    /posts           - Listar todos os posts
GET    /posts/:id       - Buscar post por ID
GET    /posts/search?q= - Buscar posts por palavra-chave
POST   /posts           - Criar post (apenas PROFESSOR)
PUT    /posts/:id       - Atualizar post (apenas PROFESSOR)
DELETE /posts/:id       - Excluir post (apenas PROFESSOR)
```

### Usuários (Apenas PROFESSOR)
```
GET    /users      - Listar todos os usuários
GET    /users/:id  - Buscar usuário por ID
PUT    /users/:id  - Atualizar usuário
DELETE /users/:id  - Excluir usuário
```

---

## Troubleshooting

### Erro "configs.toReversed is not a function" ao iniciar frontend
- **Causa**: Você está usando Node.js 18 ou inferior
- **Solução**: Atualize para Node.js 20+
  ```bash
  # Ubuntu/WSL
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs

  # Windows
  # Baixe e instale: https://nodejs.org/

  # Depois verifique
  node --version  # Deve mostrar v20.x.x

  # Re-instale as dependências
  rm -rf node_modules package-lock.json
  npm install
  npm start
  ```

### Avisos EBADENGINE ao instalar dependências
- **Normal!** São apenas avisos, não impedem a execução
- **Causa**: Algumas dependências pedem Node 20+
- **Ação**: Se você já tem Node 20+, pode ignorar esses avisos

### Backend não inicia
- Verifique se o PostgreSQL está rodando: `docker ps`
- Verifique se a porta 3000 está livre
- Execute as migrações: `cd backend && npx prisma migrate deploy`
- **Se aparecer erro "PrismaClient is unable to run in this browser environment":**
  ```bash
  cd backend
  npx prisma generate
  npm run dev
  ```

### Erro 500 ao criar usuário no backend
- **Causa mais comum**: Prisma Client não gerado
- **Solução**:
  ```bash
  cd backend
  npx prisma generate
  # Reinicie o servidor (Ctrl+C e depois npm run dev)
  ```

### Erro "docker-compose: command not found"
- Instale o Docker Desktop (já inclui docker-compose)
- Ou instale separadamente: https://docs.docker.com/compose/install/

### Erro "no configuration file provided: not found"
- Certifique-se de estar na pasta `backend` antes de rodar `docker-compose up -d`
- O arquivo `docker-compose.yml` deve estar presente no diretório

### Frontend não conecta ao backend
- Verifique se o IP está correto em `src/services/api.ts`
- Teste o backend no navegador: http://localhost:3000
- Verifique se o CORS está configurado (já está)

### Erro ao fazer login
- Verifique se criou o usuário professor no passo 3
- Confirme que o backend está rodando
- Verifique logs do backend no terminal

### Erro 409 "Login já está em uso"
- Normal! Significa que você já criou esse usuário antes
- Use um login diferente ou faça login com as credenciais existentes

### App não carrega após fechar
- Limpe o cache do Expo: `expo start -c`
- Limpe o AsyncStorage (reinstale o app)

### Frontend Web não inicia
- Verifique se a porta 3001 está livre
- Se a porta estiver ocupada, altere em `package.json` do frontend-web-shadcnui:
  ```bash
  "dev": "next dev -p 3002"  # Ou outra porta disponível
  ```
- Certifique-se de ter criado o arquivo `.env.local` com a URL da API
- Execute `npm install` dentro da pasta `frontend-web-shadcnui`

### Erro de CORS no frontend web
- Verifique se o backend está configurado para aceitar requisições do frontend web
- No arquivo `backend/src/index.ts`, certifique-se que o CORS inclui `http://localhost:3001`:
  ```typescript
  app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:2025", "http://localhost:3001"],
    credentials: true,
  }));
  ```

---

## Credenciais de Teste

| Tipo | Login | Senha | Permissões |
|------|-------|-------|------------|
| Professor | `prof` | `123456` | Criar/Editar/Excluir Posts e Usuários |
| Aluno | `joao` | `123456` | Visualizar Posts |

---

## Tecnologias Detalhadas

| Categoria | Tecnologia | Versão | Uso |
|-----------|------------|--------|-----|
| **Frontend Mobile** | React Native | 0.81.5 | Framework mobile |
| | Expo | 54.0.30 | Build e desenvolvimento |
| | TypeScript | 5.9.2 | Tipagem estática |
| | React Native Paper | 5.x | Material Design 3 UI |
| | React Navigation | 7.x | Stack + Bottom Tabs |
| | React Native Reanimated | 3.x | Animações nativas |
| | Vector Icons | - | Ícones Material Community |
| | Axios | 1.13.2 | Cliente HTTP |
| | AsyncStorage | - | Persistência local |
| **Frontend Web** | Next.js | 14.2.33 | Framework React (App Router) |
| | TypeScript | 5.x | Tipagem estática |
| | shadcn/ui | - | Biblioteca de componentes |
| | Tailwind CSS | 3.4.1 | Framework CSS |
| | Radix UI | - | Primitivos UI acessíveis |
| | Lucide React | - | Biblioteca de ícones |
| | next-themes | - | Dark mode |
| **Backend** | Node.js | 20+ | Runtime JavaScript |
| | Express | 5.1.0 | Framework web |
| | TypeScript | 5.8.3 | Tipagem estática |
| | Prisma | 6.16.3 | ORM |
| | PostgreSQL | 15+ | Banco de dados |
| | JWT | 9.0.2 | Autenticação |
| | bcrypt | 6.0.0 | Hash de senhas |
| **DevOps** | Docker | - | Containerização |
| | Docker Compose | - | Orquestração |

---

## Configurar Frontend Mobile para Dispositivo Físico

**Esta seção é apenas para o frontend mobile (React Native/Expo).**

Por padrão, o app mobile está configurado para **rodar no navegador (localhost)**. Se você quiser testar em um **celular físico** ou **emulador/simulador**, siga estas instruções:

### Pré-requisitos
- Backend rodando (`cd backend && npm run dev`)
- Saber o IP da sua máquina na rede local

### Passo 1: Descobrir o IP da Sua Máquina

**Windows:**
```powershell
ipconfig
```
Procure por **"Adaptador de Rede sem Fio Wi-Fi"** e anote o **"Endereço IPv4"**.
Exemplo: `10.10.10.25` ou `192.168.1.100`

**Mac/Linux:**
```bash
ifconfig
```
Procure pela interface de rede ativa (geralmente `en0` ou `wlan0`) e anote o **inet**.

### Passo 2: Atualizar a URL da API

Edite o arquivo `src/services/api.ts`:

```typescript
// Trocar de:
baseURL: 'http://localhost:3000',

// Para (substitua pelo SEU IP):
baseURL: 'http://10.10.10.25:3000',
```

### Passo 3: Atualizar CORS do Backend

Edite o arquivo `backend/src/index.ts` (linha ~32):

```typescript
// Trocar de:
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:2025"],
  credentials: true,
}));

// Para:
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:2025",
    "http://localhost:8081",      // Expo Dev Server
    /^http:\/\/.*:\d+$/,          // Aceita qualquer origem (desenvolvimento)
  ],
  credentials: true,
}));
```

**⚠️ IMPORTANTE**: Reinicie o backend após essa mudança:
```bash
# No terminal do backend, pressione Ctrl+C e depois:
npm run dev
```

### Passo 4: Configurar Firewall (Apenas Windows)

Se estiver usando Windows, é necessário liberar a porta 3000 no firewall.

No PowerShell **como Administrador**:
```powershell
New-NetFirewallRule -DisplayName "NexEdu Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Passo 5: (Windows + WSL) Port Forwarding

Se o backend estiver rodando no WSL, configure port forwarding.

No PowerShell **como Administrador**:
```powershell
# Descobrir o IP do WSL
wsl hostname -I
# Exemplo de retorno: 172.22.208.1

# Configurar port forwarding (substitua pelo IP do WSL)
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3000 connectaddress=172.22.208.1 connectport=3000

# Verificar se foi criado
netsh interface portproxy show all
```

### Passo 6: Testar a Conexão

**Do seu computador:**
```bash
# Substitua pelo seu IP
curl http://10.10.10.25:3000
```

Deve retornar: `API NexEdu rodando!`

**Do seu celular:**
- Certifique-se de estar na **mesma rede Wi-Fi**
- Abra o navegador e acesse: `http://10.10.10.25:3000`

### Passo 7: Iniciar o Expo

```bash
npm start
```

Agora você pode:
- **Escanear o QR Code** com o Expo Go (Android/iOS)
- **Pressionar `a`** para Android Emulator
- **Pressionar `i`** para iOS Simulator (apenas macOS)

### Troubleshooting - Dispositivo Físico

**Erro de conexão no app:**
- Verifique se celular e PC estão na mesma rede Wi-Fi
- Teste a URL no navegador do celular primeiro
- Verifique o firewall (Windows)

**Backend não responde:**
- Reinicie o backend após alterar CORS
- Verifique se o port forwarding foi configurado (WSL)
- Teste com `curl` do próprio PC primeiro

**Para voltar ao modo localhost:**
1. Reverta `src/services/api.ts` para `http://localhost:3000`
2. Reverta o CORS do backend
3. Reinicie o backend

---

## Autores

Projeto desenvolvido para o **Tech Challenge - Fase 5 (FIAP)**

---

## Changelog

**Versão 3.0 - Janeiro 2026**

### Adições
- ✨ **Novo Frontend Web** com Next.js 14 e shadcn/ui
- 📱 Suporte multiplataforma: Mobile (React Native) + Web (Next.js)
- 🎨 Interface web moderna com Tailwind CSS e componentes shadcn/ui
- 🌓 Dark mode nativo em ambas as plataformas
- ♿ Componentes acessíveis via Radix UI no frontend web

**Versão 2.0 - Janeiro 2026**

### Reformulação UI/UX Mobile
- Implementa design system baseado em Material Design 3 via React Native Paper
- Adiciona sistema de temas (light/dark mode) com ThemeContext
- Cria componentes UI reutilizáveis (Button, Card, Input, Dialog, ConfirmDialog, etc.)
- Adiciona componentes compartilhados (PostCard, UserCard, EmptyState, etc.)
- Implementa layouts consistentes (ScreenLayout, HeaderBar)
- Refatora todas as telas com novo design system
- Adiciona animações e transições suaves com React Native Reanimated
- Implementa SnackbarContext para feedback ao usuário
- Adiciona hooks customizados (useTheme, useResponsive)
- Atualiza navegação com Bottom Tabs modernizada
- Adiciona tela de perfil do usuário com configurações
- Melhora consistência visual em toda aplicação
- Otimiza performance com memoização e FlatList optimizations

---

**Última atualização**: Janeiro 2026
**Status**: Plataforma Multiplataforma Completa (Mobile + Web)
