# Dockerfile para NexEdu API
# Imagem base do Node.js LTS
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala todas as dependências (incluindo dev para build)
RUN npm ci

# Copia o restante do código
COPY . .

# Gera o cliente Prisma
RUN npx prisma generate

# Compila o TypeScript
RUN npm run build

# Remove dependências de desenvolvimento e reinstala apenas as de produção
RUN npm ci --only=production && npm cache clean --force

# Expõe a porta que a aplicação irá usar
EXPOSE 3000

# Define variáveis de ambiente
ENV NODE_ENV=production

# Comando para iniciar a aplicação (usa o JavaScript compilado)
CMD ["npm", "start"]
