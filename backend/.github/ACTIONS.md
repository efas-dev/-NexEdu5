# GitHub Actions CI/CD

Este projeto utiliza GitHub Actions para automação de CI/CD com os seguintes workflows:

## 📋 Workflows Configurados

### 1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)

- **Trigger**: Push para `main` e `develop`, Pull Requests para `main`
- **Jobs**:
  - **Test**: Executa testes, linting e type checking
  - **Build**: Constrói e publica imagem Docker (apenas branch `main`)
  - **Deploy Staging**: Deploy automático para staging (branch `develop`)
  - **Deploy Production**: Deploy automático para produção (branch `main`)

### 2. **Pull Request Checks** (`.github/workflows/pr-checks.yml`)

- **Trigger**: Pull Requests para `main` e `develop`
- **Features**:
  - Análise de qualidade de código
  - Cobertura de testes com Codecov
  - Comentários automáticos no PR com resultados
  - Build de teste da imagem Docker

### 3. **Release** (`.github/workflows/release.yml`)

- **Trigger**: Tags `v*.*.*` (ex: v1.0.0)
- **Features**:
  - Criação automática de releases no GitHub
  - Build e push de imagens Docker versionadas
  - Geração automática de changelog
  - Notificações no Slack

### 4. **Security Checks** (`.github/workflows/security.yml`)

- **Trigger**: Push, PR, agenda semanal
- **Features**:
  - Auditoria de dependências (npm audit)
  - Análise de código com CodeQL
  - Scan de segurança Docker com Trivy
  - Detecção de secrets com TruffleHog

## 🔧 Configuração Necessária

### Secrets do GitHub

Configure os seguintes secrets no seu repositório GitHub:

#### Docker Hub

```
DOCKER_USERNAME=seu_usuario_dockerhub
DOCKER_PASSWORD=sua_senha_dockerhub
```

#### Servidores de Deploy

```
STAGING_HOST=ip_servidor_staging
STAGING_USER=usuario_ssh
STAGING_SSH_KEY=chave_privada_ssh

PRODUCTION_HOST=ip_servidor_producao
PRODUCTION_USER=usuario_ssh
PRODUCTION_SSH_KEY=chave_privada_ssh
```

#### Notificações (Opcional)

```
SLACK_WEBHOOK_URL=sua_webhook_url_slack
CODECOV_TOKEN=token_codecov
```

### Environments

Configure os environments no GitHub:

- `staging`: Para deploys de homologação
- `production`: Para deploys de produção (com proteção)

## 🚀 Como Usar

### Deploy Automático

1. **Para Staging**:

   ```bash
   git push origin develop
   ```

2. **Para Produção**:
   ```bash
   git push origin main
   ```

### Criar Release

1. **Criar tag**:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. O workflow irá:
   - Executar todos os testes
   - Criar release no GitHub
   - Publicar imagem Docker
   - Enviar notificações

### Verificar Pull Requests

Os PRs são automaticamente verificados com:

- ✅ Linting e formatação
- ✅ Type checking
- ✅ Testes unitários
- ✅ Cobertura de código
- ✅ Build Docker
- ✅ Análises de segurança

## 📊 Monitoramento

### Status Badges

Adicione ao seu README:

```markdown
![CI/CD](https://github.com/Rafacolacio/NexEdu/workflows/CI/CD%20Pipeline/badge.svg)
![Security](https://github.com/Rafacolacio/NexEdu/workflows/Security%20Checks/badge.svg)
[![codecov](https://codecov.io/gh/Rafacolacio/NexEdu/branch/main/graph/badge.svg)](https://codecov.io/gh/Rafacolacio/NexEdu)
```

### Logs e Debugging

- **Visualizar logs**: GitHub Actions → Workflow → Job
- **Debug mode**: Adicione `ACTIONS_RUNNER_DEBUG=true` aos secrets
- **Step debugging**: Adicione `ACTIONS_STEP_DEBUG=true` aos secrets

## 🛠️ Personalização

### Modificar Workflows

1. **Adicionar testes**:
   - Edite o script `test` no `package.json`
   - Configure ferramentas como Jest, Mocha, etc.

2. **Configurar linting**:
   - Instale ESLint: `npm install --save-dev eslint`
   - Configure script `lint` no `package.json`

3. **Adicionar formatação**:
   - Instale Prettier: `npm install --save-dev prettier`
   - Configure scripts `format` e `format:check`

### Ambientes Personalizados

Para adicionar novos ambientes (ex: QA):

1. Crie novo environment no GitHub
2. Adicione job no workflow:
   ```yaml
   deploy-qa:
     name: Deploy to QA
     needs: build
     if: github.ref == 'refs/heads/qa'
     environment: qa
     # ... resto da configuração
   ```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Build falha**: Verifique se todos os scripts do package.json existem
2. **Deploy falha**: Confirme se os secrets estão configurados
3. **Docker push falha**: Verifique credenciais do Docker Hub
4. **SSH falha**: Confirme se a chave SSH está correta

### Debug Steps

1. Ative debug mode nos secrets
2. Adicione steps de debug nos workflows:
   ```yaml
   - name: Debug
     run: |
       echo "Event: ${{ github.event_name }}"
       echo "Ref: ${{ github.ref }}"
       echo "Actor: ${{ github.actor }}"
   ```
