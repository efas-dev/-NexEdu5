# NexEdu API - Configuração Docker

Este projeto utiliza Docker para facilitar o desenvolvimento e deployment da API NexEdu.

## Pré-requisitos

- Docker
- Docker Compose

## Configuração Inicial

1. **Clone o repositório e navegue até a pasta:**

   ```bash
   cd NexEdu
   ```

2. **Crie o arquivo de variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

## Executando com Docker

### Modo Produção

Para executar a aplicação em modo produção:

```bash
# Iniciar todos os serviços (API + PostgreSQL)
npm run docker:up

# Ou diretamente com docker-compose
docker-compose up -d
```

### Modo Desenvolvimento

Para executar em modo desenvolvimento (com hot reload):

```bash
# Iniciar em modo desenvolvimento
npm run docker:dev

# Ou diretamente com docker-compose
docker-compose --profile dev up -d
```

### Comandos Úteis

```bash
# Parar todos os serviços
npm run docker:down

# Ver logs em tempo real
npm run docker:logs

# Rebuildar e iniciar (útil após mudanças no Dockerfile)
npm run docker:rebuild

# Ver logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f postgres
```

## Acessos

- **API**: http://localhost:3000
- **API (dev)**: http://localhost:3001 (quando executado em modo dev)
- **PostgreSQL**: localhost:5432

### Credenciais do Banco (desenvolvimento)

- **Host**: localhost
- **Porta**: 5432
- **Database**: nexedu_db
- **Usuário**: nexedu
- **Senha**: nexedu123

## Estrutura dos Containers

- **nexedu-postgres**: Banco de dados PostgreSQL
- **nexedu-api**: API em modo produção (porta 3000)
- **nexedu-api-dev**: API em modo desenvolvimento (porta 3001)

## Migrations do Banco

As migrations do Prisma são executadas automaticamente quando os containers são iniciados. Se precisar executar manualmente:

```bash
# Entrar no container da API
docker exec -it nexedu-api sh

# Executar migrations
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate
```

## Desenvolvimento Local (sem Docker)

Se preferir executar localmente sem Docker:

```bash
# Instalar dependências
npm install

# Iniciar PostgreSQL via Docker (apenas o banco)
docker-compose up postgres -d

# Executar migrations
npm run prisma:migrate

# Iniciar em modo desenvolvimento
npm run dev
```

## Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs

# Rebuildar imagens
docker-compose build --no-cache
```

### Problemas com banco de dados

```bash
# Restart apenas o PostgreSQL
docker-compose restart postgres

# Limpar volumes (ATENÇÃO: remove todos os dados)
docker-compose down -v
```

### Reset completo

```bash
# Parar tudo e remover volumes
docker-compose down -v

# Remover imagens
docker-compose down --rmi all

# Reconstruir tudo
docker-compose up --build -d
```
