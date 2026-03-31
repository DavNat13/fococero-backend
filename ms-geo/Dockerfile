# ==============================================================================
# 🏗️ ETAPA 1: CONSTRUCCIÓN (Builder)
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copiamos archivos de dependencias para aprovechar el cache de capas
COPY package*.json ./
# 'npm ci' es más rápido y estricto que 'npm install' para entornos de CI/CD
RUN npm ci

# Copiamos el código fuente y compilamos TS a JS
COPY . .
RUN npm run build

# ==============================================================================
# 🚀 ETAPA 2: PRODUCCIÓN (Imagen final ligera)
# ==============================================================================
FROM node:22-alpine

LABEL maintainer="FocoCero - Inteligencia Geoespacial"
ENV NODE_ENV=production

WORKDIR /app

# Instalamos solo dependencias de producción para ahorrar espacio
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Traemos solo lo compilado desde la etapa de builder
COPY --from=builder /app/dist ./dist

# 🛡️ Seguridad: No ejecutamos como ROOT
USER node

# ms-geo suele usar el puerto 3002 (ajusta si usas otro)
EXPOSE 3002

CMD ["node", "dist/index.js"]