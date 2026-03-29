# ==============================================================================
# 🏗️ ETAPA 1: CONSTRUCCIÓN (Builder)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos dependencias primero para aprovechar la caché de Docker
COPY package*.json ./
# Usamos 'ci' para una instalación exacta, limpia y más rápida basada en el lockfile
RUN npm ci

# Copiamos el código fuente y compilamos TypeScript a JavaScript
COPY . .
RUN npm run build

# ==============================================================================
# 🚀 ETAPA 2: PRODUCCIÓN (Imagen final optimizada y segura)
# ==============================================================================
FROM node:20-alpine

# Metadatos
LABEL maintainer="FocoCero - Inteligencia Geoespacial"

# Establecemos el entorno estricto de producción
ENV NODE_ENV=production

WORKDIR /app

# Instalamos SOLO las dependencias operativas y limpiamos la caché residual
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiamos los binarios compilados de la Etapa 1
COPY --from=builder /app/dist ./dist

# 🛡️ Escudo de Archivos Estáticos: Aseguramos que el Swagger exista en producción
# (A veces tsc ignora los JSON dependiendo de la configuración del tsconfig)
COPY --from=builder /app/src/docs/swagger.json ./dist/docs/swagger.json

# 🛡️ Seguridad: Evitamos ejecutar el contenedor como ROOT
USER node

# Exponemos el puerto oficial del microservicio
EXPOSE 3002

# Comando de arranque táctico
CMD ["node", "dist/index.js"]