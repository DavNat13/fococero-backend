# FocoCero - Plataforma Inteligente de Gestión de Incendios 🌲🔥

<p align="left">
  <img src="https://img.shields.io/badge/Estado-En_Desarrollo_(Develop)-orange.svg" alt="Estado del proyecto">
  <img src="https://img.shields.io/badge/Node.js-v22-green?style=flat&logo=nodedotjs" alt="Node.js version">
  <img src="https://img.shields.io/badge/TypeScript-v5-blue?style=flat&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Database-PostgreSQL_%2B_PostGIS-blue?logo=postgresql" alt="PostgreSQL/PostGIS">
  <img src="https://img.shields.io/badge/Docker-Ready-blue?logo=docker" alt="Docker Ready">
</p>

**FocoCero** es una solución tecnológica avanzada diseñada para la **Municipalidad Valle del Sol**. Este sistema nace como respuesta a la necesidad crítica de prevenir, detectar y coordinar incendios forestales y urbanos de manera eficiente mediante una arquitectura de microservicios escalable.

Este proyecto corresponde al **Examen Final Transversal (EFT)** de la asignatura **DSY1106: DESARROLLO FULLSTACK III**.

---

## 👥 Autores

El desarrollo de esta plataforma fue liderado por:

- **Mauro Almonacid**
- **Ignacio Chacón**
- **David Nahuelcar**

---

## 📖 El Caso: Municipalidad Valle del Sol

Históricamente, la gestión de emergencias en la comuna se basaba en procesos manuales y sistemas aislados. **FocoCero** centraliza la operación mediante tres pilares:

1. **Detección Temprana:** Reportes ciudadanos con ubicación exacta.
2. **Monitoreo Geográfico:** Mapas interactivos en tiempo real con PostGIS.
3. **Comunicación Táctica:** Alertas automatizadas a la comunidad y organismos de emergencia (CONAF, Bomberos).

---

## 🏗️ Arquitectura de Microservicios

El ecosistema se divide en **5 microservicios independientes** que se comunican de forma orquestada:

| Servicio           | Responsabilidad Principal                                                                                                 |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **🚀 API Gateway** | Punto de entrada único. Gestiona el enrutamiento, seguridad perimetral y centraliza las peticiones del frontend.          |
| **🔐 MS-Auth**     | Gestión de identidad mediante Firebase Admin SDK. Control de acceso basado en roles (RBAC: Ciudadano, Brigadista, Admin). |
| **🌍 MS-Geo**      | El "cerebro" espacial. Utiliza PostGIS para calcular perímetros de fuego, zonas de riesgo y geocercas.                    |
| **📢 MS-Alertas**  | Gestión de la respuesta inmediata. Controla el despliegue de brigadas y el cambio de estados críticos.                    |
| **📋 MS-Reportes** | Captura de incidentes ciudadanos. Gestiona metadatos, categorías de incendios e historial inmutable de estados.           |

---

## 🚀 Stack Tecnológico

### Backend & Core

<p align="left">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nodejs,typescript,express,postgres,docker,firebase,githubactions" />
  </a>
</p>

- **Entorno:** Node.js v22 con TypeScript para un tipado robusto.
- **Base de Datos:** PostgreSQL con extensión **PostGIS** para análisis geográfico.
- **Seguridad:** Firebase Admin SDK y validación por JSON Web Tokens (JWT).
- **Infraestructura:** Docker y Docker Compose para orquestación local.
- **CI/CD:** Pipelines automatizados mediante GitHub Actions.

---

## 📂 Estructura del Proyecto

La arquitectura sigue una separación estricta de responsabilidades en carpetas independientes:

<details>
<summary>Haz clic para expandir la estructura de archivos</summary>

```
── 📁 fococero-backend
    ├── 📁 .github
    │   └── 📁 workflows
    │       ├── ⚙️ ci-alertas.yml
    │       ├── ⚙️ ci-auth.yml
    │       ├── ⚙️ ci-gateway.yml
    │       ├── ⚙️ ci-geo.yml
    │       └── ⚙️ ci-reportes.yml
    ├── 📁 api-gateway
    │   ├── 📁 src
    │   │   ├── 📁 config
    │   │   │   ├── 📄 cors.ts
    │   │   │   ├── 📄 envs.ts
    │   │   │   ├── 📄 firebase.ts
    │   │   │   └── 📄 logger.ts
    │   │   ├── 📁 docs
    │   │   │   ├── 📄 alertas.swagger.ts
    │   │   │   ├── 📄 auth.swagger.ts
    │   │   │   ├── 📄 geo.swagger.ts
    │   │   │   ├── 📄 reportes.swagger.ts
    │   │   │   ├── ⚙️ swagger.json
    │   │   │   └── 📄 swagger.ts
    │   │   ├── 📁 middlewares
    │   │   │   ├── 📄 auth.middleware.ts
    │   │   │   ├── 📄 errorHandler.ts
    │   │   │   ├── 📄 rateLimiter.ts
    │   │   │   └── 📄 traceId.ts
    │   │   ├── 📁 routes
    │   │   │   └── 📄 routes.ts
    │   │   └── 📄 index.ts
    │   ├── ⚙️ .gitignore
    │   ├── 🐳 Dockerfile
    │   ├── ⚙️ package-lock.json
    │   ├── ⚙️ package.json
    │   └── ⚙️ tsconfig.json
    ├── 📁 ms-alertas
    │   ├── 📁 database
    │   │   └── 📄 init.sql
    │   ├── 📁 src
    │   │   ├── 📁 @types
    │   │   │   ├── 📁 express
    │   │   │   │   └── 📄 index.d.ts
    │   │   │   └── 📄 env.d.ts
    │   │   ├── 📁 config
    │   │   │   ├── 📄 database.ts
    │   │   │   ├── 📄 envs.ts
    │   │   │   └── 📄 firebase.ts
    │   │   ├── 📁 controllers
    │   │   │   └── 📄 alerta.controller.ts
    │   │   ├── 📁 docs
    │   │   │   └── ⚙️ swagger.json
    │   │   ├── 📁 helpers
    │   │   │   └── 📄 alerta.helper.ts
    │   │   ├── 📁 middlewares
    │   │   │   ├── 📄 auth.middleware.ts
    │   │   │   ├── 📄 error.middleware.ts
    │   │   │   ├── 📄 role.middleware.ts
    │   │   │   └── 📄 validate.middleware.ts
    │   │   ├── 📁 models
    │   │   │   ├── 📄 alerta.model.ts
    │   │   │   └── 📄 user.enum.ts
    │   │   ├── 📁 repositories
    │   │   │   └── 📄 alerta.repository.ts
    │   │   ├── 📁 routes
    │   │   │   └── 📄 alerta.routes.ts
    │   │   ├── 📁 services
    │   │   │   └── 📄 alerta.service.ts
    │   │   ├── 📁 validators
    │   │   │   └── 📄 alerta.validator.ts
    │   │   └── 📄 index.ts
    │   ├── 📁 tests
    │   │   └── 📄 health.test.ts
    │   ├── ⚙️ .gitignore
    │   ├── ⚙️ .prettierrc
    │   ├── 🐳 Dockerfile
    │   ├── 📄 eslint.config.mjs
    │   ├── 📄 jest.config.js
    │   ├── ⚙️ package-lock.json
    │   ├── ⚙️ package.json
    │   └── ⚙️ tsconfig.json
    ├── 📁 ms-auth
    │   ├── 📁 src
    │   │   ├── 📁 @types
    │   │   │   ├── 📁 express
    │   │   │   │   └── 📄 index.d.ts
    │   │   │   └── 📄 env.d.ts
    │   │   ├── 📁 config
    │   │   │   ├── 📄 database.ts
    │   │   │   ├── 📄 envs.ts
    │   │   │   └── 📄 firebase.ts
    │   │   ├── 📁 controllers
    │   │   │   └── 📄 auth.controller.ts
    │   │   ├── 📁 docs
    │   │   │   └── ⚙️ swagger.json
    │   │   ├── 📁 helpers
    │   │   │   └── 📄 rut.helper.ts
    │   │   ├── 📁 middlewares
    │   │   │   ├── 📄 auth.middleware.ts
    │   │   │   ├── 📄 error.middleware.ts
    │   │   │   └── 📄 role.middleware.ts
    │   │   ├── 📁 models
    │   │   │   ├── 📄 user.enum.ts
    │   │   │   └── 📄 user.model.ts
    │   │   ├── 📁 repositories
    │   │   │   └── 📄 user.repository.ts
    │   │   ├── 📁 routes
    │   │   │   └── 📄 auth.routes.ts
    │   │   ├── 📁 services
    │   │   │   └── 📄 auth.service.ts
    │   │   ├── 📁 validators
    │   │   │   └── 📄 auth.validator.ts
    │   │   └── 📄 index.ts
    │   ├── 📁 tests
    │   │   └── 📄 health.test.ts
    │   ├── ⚙️ .dockerignore
    │   ├── ⚙️ .gitignore
    │   ├── ⚙️ .prettierrc
    │   ├── 🐳 Dockerfile
    │   ├── 📝 README.md
    │   ├── 📄 eslint.config.mjs
    │   ├── 📄 init.sql
    │   ├── 📄 jest.config.js
    │   ├── ⚙️ package-lock.json
    │   ├── ⚙️ package.json
    │   └── ⚙️ tsconfig.json
    ├── 📁 ms-geo
    │   ├── 📁 database
    │   │   └── 📄 init.sql
    │   ├── 📁 src
    │   │   ├── 📁 @types
    │   │   │   ├── 📁 express
    │   │   │   │   └── 📄 index.d.ts
    │   │   │   └── 📄 env.d.ts
    │   │   ├── 📁 config
    │   │   │   ├── 📄 database.ts
    │   │   │   ├── 📄 envs.ts
    │   │   │   └── 📄 firebase.ts
    │   │   ├── 📁 controllers
    │   │   │   └── 📄 geo.controller.ts
    │   │   ├── 📁 docs
    │   │   │   └── ⚙️ swagger.json
    │   │   ├── 📁 helpers
    │   │   │   └── 📄 geo.helper.ts
    │   │   ├── 📁 middlewares
    │   │   │   ├── 📄 auth.middleware.ts
    │   │   │   └── 📄 error.middleware.ts
    │   │   ├── 📁 models
    │   │   │   ├── 📄 geo.model.ts
    │   │   │   └── 📄 user.enum.ts
    │   │   ├── 📁 repositories
    │   │   │   └── 📄 geo.repository.ts
    │   │   ├── 📁 routes
    │   │   │   └── 📄 geo.routes.ts
    │   │   ├── 📁 services
    │   │   │   └── 📄 geo.service.ts
    │   │   ├── 📁 validators
    │   │   │   └── 📄 geo.validator.ts
    │   │   └── 📄 index.ts
    │   ├── 📁 tests
    │   │   └── 📄 geo-health.test.ts
    │   ├── ⚙️ .gitignore
    │   ├── ⚙️ .prettierrc
    │   ├── 🐳 Dockerfile
    │   ├── 📄 eslint.config.mjs
    │   ├── 📄 jest.config.js
    │   ├── ⚙️ package-lock.json
    │   ├── ⚙️ package.json
    │   └── ⚙️ tsconfig.json
    ├── 📁 ms-reportes
    │   ├── 📁 database
    │   │   └── 📄 init.sql
    │   ├── 📁 src
    │   │   ├── 📁 @types
    │   │   ├── 📁 config
    │   │   │   ├── 📄 db.ts
    │   │   │   ├── 📄 envs.ts
    │   │   │   └── 📄 firebase.ts
    │   │   ├── 📁 controllers
    │   │   │   └── 📄 reporte.controller.ts
    │   │   ├── 📁 docs
    │   │   │   └── ⚙️ swagger.json
    │   │   ├── 📁 helpers
    │   │   │   ├── 📄 appError.ts
    │   │   │   └── 📄 catchAsync.ts
    │   │   ├── 📁 middlewares
    │   │   │   ├── 📄 auth.middleware.ts
    │   │   │   ├── 📄 error.middleware.ts
    │   │   │   ├── 📄 role.middleware.ts
    │   │   │   └── 📄 validate.middleware.ts
    │   │   ├── 📁 models
    │   │   │   ├── 📄 reporte.model.ts
    │   │   │   └── 📄 user.enum.ts
    │   │   ├── 📁 repositories
    │   │   │   └── 📄 reporte.repository.ts
    │   │   ├── 📁 routes
    │   │   │   └── 📄 reporte.routes.ts
    │   │   ├── 📁 services
    │   │   │   └── 📄 reporte.service.ts
    │   │   ├── 📁 validators
    │   │   │   └── 📄 reporte.validator.ts
    │   │   └── 📄 index.ts
    │   ├── ⚙️ .gitignore
    │   ├── ⚙️ .prettierrc
    │   ├── 🐳 Dockerfile
    │   ├── 📄 eslint.config.mjs
    │   ├── 📄 jest.config.js
    │   ├── ⚙️ package-lock.json
    │   ├── ⚙️ package.json
    │   └── ⚙️ tsconfig.json
    ├── ⚙️ .gitignore
    ├── 📝 README.md
    ├── ⚙️ docker-compose.yml
    ├── ⚙️ package-lock.json
    └── ⚙️ package.json
```

</details>

## 💻 Configuración y Despliegue Local

### Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js v22](https://nodejs.org/)
- [Git](https://git-scm.com/)

### Pasos para iniciar

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/DavNat13/fococero-backend.git](https://github.com/DavNat13/fococero-backend.git)
   cd fococero-backend
   ```

### 🚀 Levantar el ecosistema

Utiliza **Docker Compose** para construir e iniciar todos los microservicios y la base de datos en segundo plano:

```bash
docker-compose up --build -d
```

### 🚦 Verificar estados

Una vez que los contenedores estén corriendo, puedes acceder a los siguientes servicios estratégicos:

- **API Gateway:** [http://localhost:3000](http://localhost:3000)
- **pgAdmin 4 (Gestor de BD):** [http://localhost:5050](http://localhost:5050)
