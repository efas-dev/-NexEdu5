# NexEdu Backend.

API RESTful para gerenciamento de posts educacionais com sistema de autenticação e autorização baseado em roles (Professor/Aluno).

## Tecnologias

- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT (JSON Web Token)
- bcrypt
- Docker & Docker Compose

## Funcionalidades

### Autenticação e Autorização
- Registro de usuários (Professor e Aluno)
- Login com geração de token JWT
- Middleware de autenticação
- Controle de acesso baseado em roles

### Gerenciamento de Usuários (Apenas Professores)
- Listar todos os usuários
- Buscar usuário por ID
- Atualizar informações de usuário
- Deletar usuário

### Gerenciamento de Posts
- Leitura de posts (Professores e Alunos autenticados)
- Criação, edição e exclusão de posts (Apenas Professores)
- Busca de posts por termo
- Relacionamento entre posts e autores

## Como usar

### Opção 1: Usando Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/Grupo-Pos-Tech/NexEdu-Projeto_FIAP.git
cd NexEdu-Projeto_FIAP/NexEdu-backend

# Copie o arquivo de ambiente
cp .env.example .env

# Inicie todos os serviços (API + PostgreSQL)
docker-compose up -d

# Visualizar logs em tempo real
docker-compose logs -f api
```

A API estará disponível em `http://localhost:3000` e o PostgreSQL na porta `5433`.

#### Comandos Docker úteis

```bash
# Parar todos os serviços
docker-compose down

# Rebuildar e iniciar (após mudanças no código)
docker-compose up --build -d

# Modo desenvolvimento (com hot reload)
docker-compose --profile dev up -d

# Ver logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f postgres

# Acessar o container da API
docker exec -it nexedu-api sh
```

### Opção 2: Executar Localmente

```bash
# Instalar dependências
npm install

# Configurar banco de dados (.env)
DATABASE_URL="postgresql://nexedu:nexedu123@localhost:5433/nexedu_db"
JWT_SECRET="nexedu-secret-key-change-in-production"

# Executar migrações
npx prisma migrate dev

# Iniciar servidor em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
# Configuração do Banco de Dados
DATABASE_URL="postgresql://nexedu:nexedu123@localhost:5433/nexedu_db"

# Configuração da API
PORT=3000
NODE_ENV=development

# JWT Secret para autenticação
JWT_SECRET="nexedu-secret-key-change-in-production"
```

### Acessos (Docker)

- **API**: http://localhost:3000
- **API (dev)**: http://localhost:3001 (quando executado em modo dev)
- **PostgreSQL**: localhost:5433
  - **Usuário**: nexedu
  - **Senha**: nexedu123
  - **Database**: nexedu_db

## Endpoints da API

### Públicos (sem autenticação)

```
POST   /auth/register      # Registrar novo usuário
POST   /auth/login         # Fazer login e obter token JWT
```

### Leitura (requer autenticação - Professores e Alunos)

```
GET    /posts              # Listar todos os posts
GET    /posts/:id          # Buscar post por ID
GET    /posts/search?q=    # Buscar posts por termo
```

### Apenas Professores (requer autenticação + role PROFESSOR)

```
# Gerenciamento de Usuários
GET    /users              # Listar todos os usuários
GET    /users/:id          # Buscar usuário por ID
PUT    /users/:id          # Atualizar usuário
DELETE /users/:id          # Deletar usuário

# Gerenciamento de Posts
POST   /posts              # Criar novo post
PUT    /posts/:id          # Atualizar post
DELETE /posts/:id          # Deletar post
```

## Modelos de Dados

### User

```json
{
  "id": 1,
  "name": "Prof. João Silva",
  "login": "joao.professor",
  "role": "PROFESSOR",
  "createdAt": "2025-10-05T20:00:00.000Z",
  "updatedAt": "2025-10-05T20:00:00.000Z"
}
```

### Post

```json
{
  "id": 1,
  "Title": "Autenticação com JWT",
  "Content": "JSON Web Token é um padrão aberto...",
  "Author": "Prof. João Silva",
  "authorId": 1,
  "author": {
    "id": 1,
    "name": "Prof. João Silva",
    "login": "joao.professor",
    "role": "PROFESSOR"
  },
  "createdAt": "2025-10-05T20:00:00.000Z",
  "updatedAt": "2025-10-05T20:00:00.000Z"
}
```

### Login Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Prof. João Silva",
    "login": "joao.professor",
    "role": "PROFESSOR"
  }
}
```

## Testes

Use o arquivo `test-requests.http` com a extensão REST Client do VS Code.

### Como testar

1. Instale a extensão REST Client no VS Code
2. Inicie o servidor com `npm run dev` ou `docker-compose up`
3. Execute as requisições de login (8 e 9) e copie os tokens retornados
4. Cole os tokens nas variáveis `@tokenProfessor` e `@tokenAluno` no arquivo
5. Execute as demais requisições clicando em "Send Request"

O arquivo contém 37 casos de teste cobrindo:
- Autenticação e registro
- CRUD completo de usuários
- CRUD completo de posts
- Testes de autorização (403 Forbidden)
- Testes de autenticação (401 Unauthorized)
- Testes de validação (400 Bad Request, 404 Not Found)

## Estrutura do Projeto

```
NexEdu-backend/
├── prisma/
│   ├── migrations/         # Migrações do banco de dados
│   └── schema.prisma       # Schema do Prisma
├── src/
│   ├── middleware/
│   │   └── auth.ts         # Middlewares de autenticação e autorização
│   └── index.ts            # Servidor Express e rotas
├── dist/                   # Build TypeScript (gerado)
├── .env                    # Variáveis de ambiente (não versionado)
├── .env.example            # Exemplo de variáveis de ambiente
├── docker-compose.yml      # Configuração Docker
├── Dockerfile              # Imagem Docker de produção
├── Dockerfile.dev          # Imagem Docker de desenvolvimento
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração TypeScript
├── test-requests.http      # Testes de API
└── README.md               # Este arquivo
```

## CI/CD com GitHub Actions

Este projeto utiliza Semantic Release com Conventional Commits para automação completa.

### Workflows Configurados

**Docker Build and Push** (`main.yml`):
- **Triggers**: Push para `main`/`develop`, tags `v*`, pull requests
- **Test Phase**: Testes automatizados com Docker + PostgreSQL
- **Build Phase**: Build multi-arquitetura (linux/amd64, linux/arm64)
- **Push Phase**: Upload automático para Docker Hub
- **Semantic Release**: Gera releases automaticamente baseado em conventional commits

### Conventional Commits

#### Tipos de commit

**Patch Version** (v1.0.0 → v1.0.1):
```bash
fix: corrigir bug na validação de dados
fix(api): resolver erro 500 no endpoint de posts
```

**Minor Version** (v1.0.0 → v1.1.0):
```bash
feat: adicionar endpoint de busca de posts
feat(auth): implementar login com JWT
```

**Major Version** (v1.0.0 → v2.0.0):
```bash
feat!: alterar estrutura da API de posts
fix!: alterar formato de resposta da API
```

**Não geram release**:
```bash
docs: atualizar README
style: formatar código
refactor: reorganizar estrutura
test: adicionar testes unitários
chore: atualizar dependências
ci: melhorar workflow
```

## Segurança

- Senhas criptografadas com bcrypt (10 rounds)
- Autenticação JWT com tokens válidos por 24 horas
- Validação de roles em todos os endpoints protegidos
- Validação de dados de entrada
- Headers de segurança configurados no Express

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Modo desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Gerar Prisma Client
npx prisma generate

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Visualizar banco de dados
npx prisma studio
```

---

Desenvolvido pela Equipe NexEdu - Pós Tech FIAP
