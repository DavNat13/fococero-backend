# --- Etapa 1: Construcción (Builder) ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Etapa 2: Producción (Imagen final ligera) ---
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# Puerto por defecto (cambiar en cada microservicio)
EXPOSE 3000

CMD ["node", "dist/index.js"]