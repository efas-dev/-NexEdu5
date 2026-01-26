# ⚡ Configuração Rápida - GitHub Actions

Este guia vai te ajudar a configurar o GitHub Actions em **menos de 2 minutos** ⏱️

## 🎯 **Setup Zero-Config**

✅ **Não precisa de Docker Hub!**  
✅ **Não precisa de secrets!**  
✅ **Não precisa de servidores!**  
✅ **Não precisa de configuração externa!**

## 🚀 **Como Funciona**

### ✅ **No branch `main`:**

- Roda testes automáticos com PostgreSQL
- Compila TypeScript
- Testa build da imagem Docker localmente
- Salva artefatos de build
- Comenta no commit se tudo passou

### ✅ **No branch `develop`:**

- Roda apenas os testes
- Não faz build Docker

### ✅ **Em Pull Requests:**

- Testes completos
- Verificação de qualidade

## � **Testando Agora**

```bash
# Faça um commit qualquer
git add .
git commit -m "test: CI sem Docker Hub"
git push origin main
```

**Pronto!** 🎉 Vá na aba **Actions** e veja funcionando.

## 📦 **O que Você Ganha**

- ✅ **Testes automáticos** com PostgreSQL real
- ✅ **Build validation** da imagem Docker
- ✅ **TypeScript compilation** check
- ✅ **Comentários automáticos** no commit
- ✅ **Artefatos salvos** (arquivos compilados)
- ✅ **Zero custo** e zero configuração

## 🔄 **Para Usar Docker Localmente**

```bash
# Continua funcionando normalmente
docker-compose up -d
```

## 💡 **Futuro: Adicionando Docker Hub**

Quando o **dono do repositório** quiser:

1. **Criar conta Docker Hub**
2. **Adicionar secrets**:
   ```
   DOCKER_USERNAME = conta_do_dono
   DOCKER_PASSWORD = senha_do_dono
   ```
3. **Alterar workflow** para fazer push das imagens

---

✅ **Configuração completa!** Zero setup, máximo resultado.
ssh-copy-id -i ~/.ssh/nexedu_deploy.pub usuario@servidor_staging
ssh-copy-id -i ~/.ssh/nexedu_deploy.pub usuario@servidor_producao

```

3. **Adicionar secrets no GitHub**:
```

STAGING_HOST = ip_servidor_staging
STAGING_USER = usuario_ssh
STAGING_SSH_KEY = conteúdo_da_chave_privada

PRODUCTION_HOST = ip_servidor_producao  
PRODUCTION_USER = usuario_ssh
PRODUCTION_SSH_KEY = conteúdo_da_chave_privada

```

### Notificações Slack

1. Crie webhook no Slack
2. Adicione secret:
```

SLACK_WEBHOOK_URL = https://hooks.slack.com/services/...

```

### Cobertura de Código

1. Crie conta no [Codecov](https://codecov.io)
2. Conecte seu repositório
3. Adicione secret:
```

CODECOV_TOKEN = token_do_codecov

````

## Troubleshooting

### ❌ Build falha
- Verifique se `DOCKER_USERNAME` e `DOCKER_PASSWORD` estão corretos
- Confirme se você tem permissão de push no Docker Hub

### ❌ Deploy falha
- Verifique se os IPs dos servidores estão corretos
- Confirme se a chave SSH está no formato correto
- Teste a conexão SSH manualmente

### ❌ Secrets não funcionam
- Nomes dos secrets são case-sensitive
- Não use espaços nos nomes
- Valores não devem ter quebras de linha extras

## Status após Configuração

Após configurar corretamente, você terá:

✅ Build automático no push para `main`
✅ Imagens Docker publicadas automaticamente
✅ Testes executados em cada PR
✅ Deploy automático (se configurado)
✅ Releases automáticas com tags
✅ Verificações de segurança semanais

## Próximos Passos

1. Configure ferramentas de qualidade:
```bash
npm install --save-dev eslint prettier jest @types/jest
````

2. Implemente testes reais no projeto

3. Configure linting e formatação

4. Adicione mais verificações de segurança
