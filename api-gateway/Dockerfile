# ==============================================================================
# 🏗️ ETAPA 1: CONSTRUCCIÓN (Builder)
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==============================================================================
# 🚀 ETAPA 2: PRODUCCIÓN (Imagen final ligera)
# ==============================================================================
FROM node:22-alpine

LABEL maintainer="FocoCero - API Gateway"
ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]