# FocoCero - Backend

Backend de la plataforma inteligente de gestión de incendios, basado en una arquitectura de microservicios.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Microservicios](#microservicios)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Endpoints](#endpoints)
- [Autenticación y Seguridad](#autenticación-y-seguridad)
- [Contribución](#contribución)

---

## Descripción

FocoCero es un sistema de gestión de emergencias desarrollado para la **Municipalidad Valle del Sol**. El backend está basado en una arquitectura de **microservicios** que permite:

- **Escalabilidad**: Cada servicio escala de manera independiente
- **Mantenibilidad**: Código modular y separable
- **Resiliencia**: Aislamiento de fallos entre servicios
- **Desarrollo paralelo**: Equipos pueden trabajar en diferentes servicios simultáneamente

Este proyecto corresponde al **Examen Final Transversal (EFT)** de la asignatura **DSY1106: DESARROLLO FULLSTACK III**.

---

## Arquitectura

### Topología

```
                    ┌─────────────────┐
                    │   FRONTEND      │
                    │   (Expo/React)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  API GATEWAY    │  :3000
                    │   (BFF + Proxy) │
                    └────────┬────────┘
                             │
        ┌──────────┬─────────┼─────────┬──────────┐
        │          │         │         │          │
        ▼          ▼         ▼         ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
   │ ms-    │ │ ms-    │ │ ms-    │ │ ms-    │ │ ms-    │
   │ auth   │ │ geo    │ │ alertas│ │reportes│ │multimedia
   │ :3001  │ │ :3002  │ │ :3003  │ │ :3004  │ │ :3005  │
   └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
        │          │         │         │          │
        └──────────┴─────────┼─────────┴──────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ PostgreSQL +   │
                    │ PostGIS        │ :5432
                    └─────────────────┘
```

### Patrón de Comunicación

- **Cliente → Gateway**: REST sobre HTTP
- **Gateway → Microservicios**: Proxy mediante `http-proxy-middleware`
- **Microservicios → Base de Datos**: PostgreSQL con extensión PostGIS

---

## Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| **Runtime** | Node.js v22 |
| **Lenguaje** | TypeScript (strict mode) |
| **Framework** | Express.js |
| **Base de Datos** | PostgreSQL + PostGIS |
| **Autenticación** | Firebase Admin SDK |
| **Validación** | Zod |
| **Contenedores** | Docker + Docker Compose |
| **Testing** | Jest |
| **Linting** | ESLint |
| **Formateo** | Prettier |

---

## Microservicios

| # | Microservicio | Puerto | Descripción |
|---|---------------|--------|-------------|
| 1 | **api-gateway** | 3000 | BFF (Backend for Frontend) - Punto de entrada único |
| 2 | **ms-auth** | 3001 | Autenticación y gestión de usuarios (Firebase) |
| 3 | **ms-geo** | 3002 | Focos georreferenciados, análisis espacial (PostGIS) |
| 4 | **ms-alertas** | 3003 | Gestión de alertas en tiempo real |
| 5 | **ms-reportes** | 3004 | Sistema de reportes ciudadanos |
| 6 | **ms-multimedia** | 3005 | Gestión de evidencias (fotos/videos) |
| 7 | **ms-emergencias** | 3006 | Coordinación de despachos a organismos |
| 8 | **ms-analitica** | 3007 | Dashboard, métricas y analítica predictiva |

---

## Estructura del Proyecto

```
fococero-backend/
├── api-gateway/              # BFF - Punto de entrada
│   ├── src/
│   │   ├── config/           # Configuración (envs, firebase, logger)
│   │   ├── docs/            # Swagger/OpenAPI
│   │   ├── middlewares/     # Auth, rate limiting, trazas
│   │   └── routes/          # Enrutamiento del gateway
│   └── Dockerfile
├── ms-auth/                  # Autenticación
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── helpers/         # Utilidades (RUT validator)
│   │   ├── middlewares/     # Auth, roles, errores
│   │   ├── models/          # Entity models
│   │   ├── repositories/    # Acceso a datos
│   │   ├── routes/          # Endpoints
│   │   ├── services/        # Lógica de negocio
│   │   └── validators/      # Validación Zod
│   ├── database/            # Scripts SQL
│   └── Dockerfile
├── ms-geo/                  # Geoespacial
├── ms-alertas/              # Alertas
├── ms-reportes/             # Reportes ciudadanos
├── ms-multimedia/           # Multimedia
├── ms-emergencias/          # Despachos
├── ms-analitica/            # Analítica
├── docker-compose.yml       # Orquestación
├── package.json             # Workspace root
└── README.md
```

### Estructura de un Microservicio (Estándar)

```
ms-[servicio]/
├── src/
│   ├── config/          # Configuración del servicio
│   ├── controllers/     # Manejo de requests/responses
│   ├── docs/            # Documentación Swagger
│   ├── helpers/         # Funciones utilitarias
│   ├── middlewares/     # Middlewares específicos
│   ├── models/          # Modelos de datos
│   ├── repositories/    # Capa de acceso a datos
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── validators/      # Validadores Zod
│   └── index.ts         # Punto de entrada
├── database/            # Scripts SQL (DDL, seeds)
├── tests/               # Tests unitarios
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Instalación

### Prerrequisitos

- Docker Desktop (última versión)
- Node.js v22+ (para desarrollo local sin Docker)
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/DavNat13/fococero-backend.git
cd fococero-backend
```

### 2. Configurar variables de entorno

Cada microservicio tiene su propio `.env`. Ver `.env.example` en cada directorio.

```bash
# Copiar ejemplo de variables para el gateway
cp api-gateway/.env.example api-gateway/.env

# Para cada microservicio
cp ms-auth/.env.example ms-auth/.env
cp ms-geo/.env.example ms-geo/.env
# ... etc
```

---

## Configuración

### Variables de Entorno del Gateway

```env
# Puerto del gateway
PORT=3000

# URLs de los microservicios
AUTH_SERVICE_URL=http://ms-auth:3001
GEO_SERVICE_URL=http://ms-geo:3002
ALERTAS_SERVICE_URL=http://ms-alertas:3003
REPORTES_SERVICE_URL=http://ms-reportes:3004
MULTIMEDIA_SERVICE_URL=http://ms-multimedia:3005
EMERGENCIAS_SERVICE_URL=http://ms-emergencias:3006
ANALITICA_SERVICE_URL=http://ms-analitica:3007

# Seguridad interna (para comunicación entre servicios)
INTERNAL_SECRET_TOKEN=your_internal_secret_token

# Firebase
FIREBASE_PROJECT_ID=fococero-218bf
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...

# Base de datos
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=fococero
POSTGRES_PASSWORD=password
POSTGRES_DB=fococero_db
```

### Base de Datos

El proyecto utiliza **PostgreSQL con extensión PostGIS** para soportar operaciones geoespaciales:

- Tipos de datos geométricos (POINT, POLYGON, etc.)
- Funciones de análisis espacial (ST_Distance, ST_Within, etc.)
- Índices espaciales para optimización de consultas

---

## Ejecución

### Modo Desarrollo (Docker Compose)

```bash
# Construir y levantar todos los servicios
docker-compose up --build -d

# Ver logs de un servicio específico
docker-compose logs -f ms-auth

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

### Verificación de Servicios

```bash
# Health check del gateway
curl http://localhost:3000/health

# Health check de un microservicio
curl http://localhost:3001/health
```

### Servicios Disponibles

| Servicio | URL | Descripción |
|-----------|-----|-------------|
| API Gateway | http://localhost:3000 | Punto de entrada principal |
| pgAdmin | http://localhost:5050 | Administrador de PostgreSQL |
| Swagger (Gateway) | http://localhost:3000/api/docs | Documentación API |

---

## Endpoints

### API Gateway

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check del gateway |

### ms-auth (Puerto 3001 → `/api/auth`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/register-guest` | ❌ | Registro de invitado |
| POST | `/register-full` | ❌ | Registro completo con Firebase |
| GET | `/me` | ✅ | Obtener perfil del usuario |
| PATCH | `/me` | ✅ | Actualizar perfil |
| PATCH | `/me/fcm-token` | ✅ | Sincronizar token FCM |
| GET | `/users` | ✅ (ADMIN) | Listar usuarios |
| PATCH | `/users/:id/role` | ✅ (ADMIN) | Cambiar rol |
| PATCH | `/users/:id/status` | ✅ (ADMIN) | Cambiar estado |
| DELETE | `/users/:id` | ✅ (ADMIN) | Eliminar usuario |

### ms-alertas (Puerto 3003 → `/api/alertas`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Crear alerta |
| GET | `/mis-alertas` | ✅ | Mis alertas |
| GET | `/cercanas` | ✅ | Alertas cercanas |
| GET | `/` | ✅ (ADMIN/BRIGADISTA) | Todas las alertas |
| GET | `/:id` | ✅ | Ver alerta por ID |
| POST | `/:id/verificar` | ✅ (ADMIN/BRIGADISTA) | Verificar alerta |
| PATCH | `/:id/estado` | ✅ (ADMIN/BRIGADISTA) | Cambiar estado |
| DELETE | `/:id` | ✅ (ADMIN) | Eliminar alerta |

### ms-reportes (Puerto 3004 → `/api/reportes`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/categorias` | ✅ | Listar categorías |
| POST | `/` | ✅ | Crear reporte |
| GET | `/` | ✅ | Listar reportes |
| GET | `/me` | ✅ | Mis reportes |
| GET | `/:id` | ✅ | Ver reporte por ID |
| PATCH | `/:id` | ✅ | Actualizar reporte |
| DELETE | `/:id` | ✅ | Eliminar reporte |
| GET | `/:id/historial` | ✅ (ADMIN/BRIGADISTA) | Ver historial |
| PATCH | `/:id/estado` | ✅ (ADMIN/BRIGADISTA) | Cambiar estado |

### ms-geo (Puerto 3002 → `/api/geo`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/` | ❌ | Reportar foco |
| GET | `/` | ❌ | Obtener todos los focos |
| GET | `/cercanos` | ❌ | Focos cercanos |
| GET | `/:id` | ❌ | Ver foco por ID |
| PATCH | `/:id/estado` | ✅ (ADMIN/BRIGADISTA) | Cambiar estado |
| PATCH | `/:id/perimetro` | ✅ (ADMIN/BRIGADISTA) | Actualizar perímetro |
| PUT | `/:id` | ✅ (ADMIN/BRIGADISTA) | Actualizar foco |
| DELETE | `/:id` | ✅ (ADMIN/BRIGADISTA) | Eliminar foco |

### ms-emergencias (Puerto 3006 → `/api/emergencias`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/despachos` | ✅ (ADMIN/BRIGADISTA) | Crear despacho |
| POST | `/despachos/retry` | ✅ (ADMIN) | Reintentar despacho fallido |
| GET | `/despachos/:correlation_id` | ✅ | Consultar estado |
| PATCH | `/despachos/:id/estado` | ✅ | Actualizar estado |

### ms-analitica (Puerto 3007 → `/api/analitica`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/ops/*` | ✅ (ADMIN/BRIGADISTA) | Operaciones |
| GET | `/core/*` | ✅ (ADMIN/BRIGADISTA) | Métricas core |
| GET | `/espacial/*` | ✅ (ADMIN/BRIGADISTA) | Análisis espacial |
| GET | `/filtros/*` | ✅ (ADMIN/BRIGADISTA) | Filtros |
| GET | `/exportar/*` | ✅ (ADMIN/BRIGADISTA) | Exportar datos |
| GET | `/predictiva/*` | ✅ (ADMIN) | Analítica predictiva |

### ms-multimedia (Puerto 3005 → `/api/multimedia`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/upload` | ✅ | Subir archivo |
| GET | `/:id` | ✅ | Descargar archivo |
| DELETE | `/:id` | ✅ | Eliminar archivo |

---

## Autenticación y Seguridad

### Flujo de Autenticación

1. **Usuario se autentica** en el frontend (Firebase/Google)
2. **Frontend obtiene** Firebase Token
3. **Frontend envía** token en header: `Authorization: Bearer <firebase_token>`
4. **API Gateway valida** el token usando Firebase Admin SDK
5. **Gateway añade** header interno: `x-internal-token` para comunicación entre servicios

### Roles (RBAC)

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **CIUDADANO** | Usuario básico | Crear reportes, ver alertas cercanas, subir multimedia |
| **BRIGADISTA** | Personal de terreno | Todo lo de ciudadano + gestionar estados, despachos, dashboard |
| **ADMIN** | Administrador | Control total del sistema |

### Middlewares de Seguridad

- **validateFirebaseToken**: Valida token de Firebase en rutas privadas
- **authorizeRole**: Verifica rol del usuario
- **rateLimit**: Previene ataques de fuerza bruta
- **traceId**: Trazabilidad de peticiones

---

## Contribución

### Conventional Commits

```bash
feat(auth): agregar login con Google
fix(alertas): corregir validación de estado
refactor(geo): simplificar consulta de focos cercanos
docs(readme): actualizar documentación de instalación
test(reportes): agregar tests para controlador
```

### Ramas

- `main` - Producción
- `develop` - Integración
- `feature/[nombre]` - Desarrollo
- `fix/[nombre]` - Correcciones
- `hotfix/[nombre]` - Correcciones urgentes

### Pruebas

```bash
# Ejecutar tests de un servicio
cd ms-auth
npm test

# Ejecutar con coverage
npm test -- --coverage
```

---

## Autores

- **Mauro Almonacid**
- **Ignacio Chacón**
- **David Nahuelcar**

Desarrollado para **DSY1106: DESARROLLO FULLSTACK III** - DUOC UC

---

## Notas de Desarrollo

### Redes Locales

El Gateway écoute en `0.0.0.0:3000` para ser accesible desde dispositivos en la misma red local. La IP del host debe ser usada por el frontend (ej: `192.168.x.xxx:3000`).

### Base de Datos Compartida

Todos los microservicios comparten la misma base de datos PostgreSQL pero tienen **schemas separados**:
- `auth.*` - Tablas de autenticación
- `geo.*` - Tablas geoespaciales
- `alertas.*` - Tablas de alertas
- `reportes.*` - Tablas de reportes

### Health Checks

Cada microservicio expone `/health` para verificación de estado en Docker.

---

## Licencia

MIT © 2024 FocoCero - DUOC UC