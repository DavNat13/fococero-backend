// .specs/roadmap.md

---

# Backend — Hoja de Ruta e Hitos (Estado: Integrado)

## Fase 1: Fundación e Infraestructura (Completado)

- [x] Inicialización del monorepo y workspace npm.
- [x] Definición de estructura de microservicios.
- [x] Configuración de Docker Compose con PostgreSQL + PostGIS.
- [x] Creación de API Gateway (BFF) con proxy y middlewares de seguridad.
- [x] Configuración de ESLint (Flat Config) + TypeScript strict mode.

## Fase 2: Microservicios Core (Completado)

- [x] **ms-auth**: Autenticación Firebase + RBAC + CRUD de usuarios.
- [x] **ms-geo**: Focos georreferenciados con PostGIS (índices GIST, GEOGRAPHY).
- [x] **ms-alertas**: Gestión de alertas con historial y borrado lógico.
- [x] **ms-reportes**: Reportes ciudadanos con categorías e historial de estados.
- [x] **ms-multimedia**: Subida/descarga/eliminación de evidencias.

## Fase 3: Service Discovery y Resiliencia (Completado)

- [x] Implementación de Eureka Server (Steeltoe) en Docker.
- [x] Integración de Eureka Client en todos los microservicios (9/9).
- [x] Patrón de graceful shutdown (deregister → close HTTP → close DB pool).
- [x] Detección híbrida Docker/Local (DB_HOST vs DB_HOST_LOCAL).

## Fase 4: Nuevos Microservicios (Completado)

- [x] **ms-emergencias**: Coordinación de despachos con idempotencia y retry.
- [x] **ms-analitica**: Dashboard, métricas, analítica predictiva con Redis y tablas particionadas.
- [x] Integración de 7 bases de datos independientes con init scripts numerados.
- [x] Capa de caché distribuida con Redis 7.

## Fase 5: Estandarización y Arquetipos (Completado)

- [x] **ms-template**: Arquetipo base con arquitectura hexagonal.
- [x] Ecosistema .specs/ con 18 skills de estándares de código.
- [x] Documentación de arquitectura y endpoints en README.
- [x] Configuración de GitHub Actions CI para todos los microservicios.

## Fase 6: Próximos Pasos (Pendiente)

- [ ] Documentación unificada Swagger/OpenAPI.
- [ ] Tests unitarios con cobertura ≥ 80% en cada microservicio.
- [ ] Pipeline CI/CD completo con build, test y deploy.
- [ ] RabbitMQ operativo para mensajería asíncrona entre servicios.
- [ ] Despliegue en entorno de producción (contenedores optimizados).
- [ ] Monitoreo distributed tracing.
- [ ] Hito académico: Identificar y documentar 3 patrones de diseño en backend.
