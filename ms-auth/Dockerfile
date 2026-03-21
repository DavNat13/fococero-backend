# Etapa 1: Construcción (Builder)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción (Imagen final más ligera y segura)
FROM node:20-alpine
WORKDIR /app
# Copiamos solo los archivos necesarios de la etapa anterior
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

EXPOSE 3001
# Comando de inicio
CMD ["node", "dist/index.js"]