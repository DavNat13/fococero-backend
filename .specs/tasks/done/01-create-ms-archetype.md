// .specs/tasks/draft/01-create-ms-archetype.md
# Spec: Arquetipo Base para Microservicios (Node.js/TypeScript)

## 1. Contexto y Objetivo
Para cumplir con el requerimiento académico de "Arquetipos" (equivalente a Maven en el ecosistema Node), necesitamos crear una plantilla estandarizada (`ms-template`). Este template servirá como molde para generar futuros microservicios dentro de la malla Zero-Trust de FocoCero.

## 2. Requerimientos de la Plantilla (`ms-template/`)
El agente `@backend-architect` debe crear un directorio `ms-template/` en la raíz del backend que contenga estrictamente:
- `package.json`: Con dependencias base (express, eureka-js-client, zod, amqplib, typescript).
- `Dockerfile` y `.dockerignore`: Configurados para producción (Node 20 Alpine).
- `tsconfig.json` y `eslint.config.mjs`: Copiados del estándar de los otros microservicios.
- `src/`: Estructura Hexagonal vacía pero definida (rutas, controladores, servicios, repositorios, modelos).
- `src/index.ts`: Servidor express básico con el cliente Eureka comentado/preparado.

## 3. Documentación del Arquetipo
Generar un archivo `README.md` dentro de `ms-template/` con instrucciones claras sobre cómo un desarrollador debe copiar esta carpeta, renombrarla y registrarla en el `docker-compose.yml` para lanzar un nuevo microservicio al ecosistema.