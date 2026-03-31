# --- Etapa 1: Construcción (Builder) ---
# node:22-alpine para mayor rendimiento y soporte de 2026
FROM node:22-alpine AS builder
WORKDIR /app

# Copiamos archivos de dependencias primero para aprovechar el cache de capas de Docker
COPY package*.json ./
RUN npm install

# Copiamos el resto del código y compilamos
COPY . .
RUN npm run build

# --- Etapa 2: Producción (Imagen final ligera) ---
FROM node:22-alpine
WORKDIR /app

# Definimos el entorno como producción
ENV NODE_ENV=production

# Copiamos solo lo esencial
COPY package*.json ./
# Instalamos solo dependencias de producción (omitimos devDependencies como TS o Jest)
RUN npm install --omit=dev

# Traemos la carpeta dist del builder
COPY --from=builder /app/dist ./dist

# Exponemos el puerto definido en tu ms-auth
EXPOSE 3001

# Iniciamos el servicio
CMD ["node", "dist/index.js"]