# --- Etapa 1: Construcción (Builder) ---
# node:22-alpine para mayor rendimiento y soporte de 2026
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER node

EXPOSE 3001

CMD ["node", "dist/index.js"]