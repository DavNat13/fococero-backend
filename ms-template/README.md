# ==========================================
# 🏗️ Arquetipo de Microservicio FocoCero
# ==========================================

Este directorio contiene una plantilla base para crear nuevos microservicios en el ecosistema FocoCero, siguiendo la arquitectura hexagonal y las mejores prácticas del proyecto.

---

## 📁 Estructura del Proyecto

```
ms-template/
├── database/
│   └── init.sql                 # Script de inicialización de BD
├── src/
│   ├── @types/                  # Tipos personalizados (Express, etc.)
│   │   └── express.d.ts
│   ├── config/                  # Configuración centralizada
│   │   ├── database.ts          # Pool de PostgreSQL
│   │   ├── envs.ts              # Variables de entorno
│   │   └── eureka.client.ts     # Cliente Eureka (comentado)
│   ├── controllers/            # Controladores HTTP
│   │   └── resource.controller.ts
│   ├── helpers/                 # Funciones utilitarias
│   │   └── index.ts
│   ├── middlewares/             # Middlewares Express
│   │   ├── auth.middleware.ts   # Autenticación
│   │   ├── error.middleware.ts   # Manejo de errores
│   │   └── validate.middleware.ts
│   ├── models/                  # Interfaces y tipos de datos
│   │   └── resource.model.ts
│   ├── repositories/            # Acceso a datos (patrón Repository)
│   │   └── resource.repository.ts
│   ├── routes/                  # Definición de rutas
│   │   ├── index.routes.ts
│   │   └── example.routes.ts
│   ├── services/                # Lógica de negocio
│   │   └── resource.service.ts
│   ├── validators/             # Esquemas Zod para validación
│   │   └── resource.validator.ts
│   └── index.ts                 # Punto de entrada
├── .dockerignore
├── Dockerfile
├── eslint.config.mjs
├── package.json
├── README.md
└── tsconfig.json
```

---

## 🚀 Cómo Crear un Nuevo Microservicio

### Paso 1: Copiar la Plantilla

Copia el directorio `ms-template/` con el nombre de tu nuevo servicio:

```bash
# En la raíz del proyecto backend (fococero-backend)
cp -r ms-template ms-mi-nuevo-servicio
```

### Paso 2: Personalizar el Microservicio

#### 2.1. Renombrar y configurar `package.json`

```json
{
  "name": "ms-mi-nuevo-servicio",
  "version": "1.0.0",
  "description": "Descripción del nuevo microservicio",
  ...
}
```

#### 2.2. Configurar el archivo `.env`

Crea un archivo `.env` en la raíz del servicio:

```env
# Puerto del servicio
PORT=3010

# Base de datos PostgreSQL
DB_HOST=db-fococero
DB_PORT=5432
DB_USER=fococero_admin
DB_PASSWORD=fococero_pass
DB_NAME=fococero_mi_servicio

# Redis
REDIS_HOST=redis-fococero
REDIS_PORT=6379

# Eureka Service Discovery
EUREKA_HOST=eureka-server
EUREKA_PORT=8761

# RabbitMQ (opcional)
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

#### 2.3. Configurar el Dockerfile

Actualiza el número de puerto en el `Dockerfile`:

```dockerfile
EXPOSE 3010
```

#### 2.4. Crear el script de inicialización de BD

Edita `database/init.sql` con las tablas y datos específicos de tu servicio.

### Paso 3: Registrar en docker-compose.yml

Agrega tu servicio en `docker-compose.yml` en la raíz del proyecto:

```yaml
services:
  # ... servicios existentes ...

  ms-mi-nuevo-servicio:
    build: ./ms-mi-nuevo-servicio
    container_name: ms-mi-nuevo-servicio
    restart: on-failure
    expose:
      - "3010"
    env_file: ./ms-mi-nuevo-servicio/.env
    depends_on:
      db-fococero:
        condition: service_healthy
      eureka-server:
        condition: service_started
    networks:
      - fococero-network
```

### Paso 4: Inicializar la Base de Datos

Agrega el script de inicialización en `docker-compose.yml`:

```yaml
db-fococero:
  volumes:
    # ... otros scripts ...
    - ./ms-mi-nuevo-servicio/database/init.sql:/docker-entrypoint-initdb.d/XX-init-mi-servicio.sql
```

### Paso 5: Registrar en el API Gateway

Edita `api-gateway/src/routes/routes.config.ts` para añadir las rutas del nuevo servicio:

```typescript
{
    path: '/api/mi-servicio',
    target: 'http://ms-mi-nuevo-servicio:3010',
    changeOrigin: true,
    router: {
        '/api/v1': '/api/v1'
    }
}
```

### Paso 6: Construir e Iniciar

```bash
# Construir la imagen Docker
docker compose build ms-mi-nuevo-servicio

# Iniciar el servicio
docker compose up -d ms-mi-nuevo-servicio

# Ver logs
docker compose logs -f ms-mi-nuevo-servicio
```

---

## 📦 Dependencias Incluidas

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| express | ^4.21.2 | Framework web |
| eureka-js-client | ^4.5.0 | Service discovery |
| zod | ^3.24.1 | Validación de esquemas |
| amqplib | ^0.10.5 | Cliente RabbitMQ |
| typescript | ^5.7.2 | Lenguaje |
| pg | ^8.13.1 | Driver PostgreSQL |
| helmet | ^8.0.0 | Seguridad HTTP |
| cors | ^2.8.5 | CORS |
| express-rate-limit | ^7.5.0 | Rate limiting |
| morgan | ^1.10.0 | Logging HTTP |

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo con hot-reload
npm run dev

# Compilar TypeScript
npm run build

# Iniciar en producción
npm start

# Linting
npm run lint

# Formatear código
npm run format
```

---

## 🏛️ Arquitectura Hexagonal

La plantilla sigue el patrón de **Arquitectura Hexagonal** (Ports & Adapters):

```
┌─────────────────────────────────────────────────────┐
│                    Capas                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🖥️ Controllers    →  Adaptadores de entrada     │
│  (HTTP)                 (Inbound)                   │
│                                                     │
│  ⚙️ Services        →  Lógica de negocio           │
│  (Use Cases)                                    │
│                                                     │
│  📦 Repositories    →  Adaptadores de salida       │
│  (Data Access)        (Outbound)                    │
│                                                     │
│  🗄️ Models          →  Entidades y DTOs            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📡 Eureka Service Discovery

El cliente Eureka viene **comentado** por defecto. Para activar el registro del servicio:

1. Descomenta las líneas en `src/config/eureka.client.ts`
2. Descomenta la llamada en `src/index.ts`
3. Asegúrate de que el servidor Eureka esté disponible

---

## 📚 Recursos Adicionales

- [Documentación de Express](https://expressjs.com/)
- [Zod Validation](https://zod.dev/)
- [Eureka JS Client](https://www.npmjs.com/package/eureka-js-client)
- [Patrón Hexagonal (Dominio Drivado)](https://alistair.cockburn.us/hexagonal+architecture)

---

**FocoCero Backend** - Node.js/TypeScript Microservices Template