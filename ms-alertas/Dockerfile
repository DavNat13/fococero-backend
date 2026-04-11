# ms-alertas/Dockerfile

# ==========================================
# Etapa 1: Construcción (Builder)
# ==========================================
FROM node:22-alpine AS builder

# Directorio de trabajo
WORKDIR /app

# Copiamos solo los archivos de dependencias primero (aprovecha la caché de Docker)
COPY package*.json ./

# Instalamos TODAS las dependencias (incluyendo las de desarrollo para compilar)
RUN npm ci
# Copiamos el resto del código fuente
COPY . .

# Compilamos TypeScript a JavaScript (crea la carpeta /dist)
RUN npm run build

# ==========================================
# Etapa 2: Producción (Runtime)
# ==========================================
FROM node:22-alpine

# Establecemos el entorno en producción de forma inmutable
ENV NODE_ENV=production

# Directorio de trabajo
WORKDIR /app

# Copiamos solo los archivos de dependencias
COPY package*.json ./

# Instalamos SOLO las dependencias de producción (reduce drásticamente la superficie de ataque y peso)
RUN npm ci --omit=dev

# Copiamos la carpeta compilada desde la Etapa 1
COPY --from=builder /app/dist ./dist

# Por seguridad, usamos el usuario 'node' sin privilegios de root
USER node

# Exponemos el puerto 3003 (Exclusivo para ms-alertas)
EXPOSE 3003

# Comando de arranque del microservicio
CMD ["node", "dist/index.js"]