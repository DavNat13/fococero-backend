# 🛡️ FocoCero - Microservicio de Autenticación (ms-auth)

**ms-auth** es el microservicio guardián del ecosistema **FocoCero**. Actúa como la primera línea de defensa de la plataforma, encargado de gestionar la identidad de los ciudadanos, brigadistas y administradores, asegurando que solo usuarios verificados puedan interactuar con el sistema de reportes de emergencias.

## 🎯 ¿Qué problema resuelve?
En situaciones de emergencia (como incendios forestales), la veracidad de la información es vital. Este microservicio resuelve el problema de los **reportes falsos** y el **spam** mediante:
1. **Validación Estricta de Identidad:** Integración con Google Firebase para asegurar que detrás de cada cuenta hay una persona real.
2. **Estandarización Nacional:** Validación matemática del RUT chileno (Módulo 11) para evitar registros duplicados o falsos.
3. **Canal de Alertas:** Vinculación y actualización del `fcm_token` (Firebase Cloud Messaging) del dispositivo móvil, permitiendo que el sistema envíe notificaciones push geolocalizadas al usuario en caso de evacuación o emergencia cercana.

---

## 🛠️ Tecnologías Utilizadas

* **Lenguaje:** Node.js con TypeScript (Tipado estricto).
* **Framework:** Express.js.
* **Base de Datos:** PostgreSQL (pg pool).
* **Autenticación:** Firebase Admin SDK (Tokens JWT delegados a Google).
* **Seguridad:** Helmet, Express-Rate-Limit, CORS estricto.
* **Testing & CI/CD:** Jest, Supertest, ts-jest, GitHub Actions.
* **Calidad y Documentación:** ESLint, Prettier, Swagger UI.
* **Infraestructura:** Docker (Alpine Linux), Graceful Shutdown.

---

## 🔒 Seguridad Perimetral y Autenticación de Alto Nivel
Para garantizar una disponibilidad del 99.9% y proteger los datos de los ciudadanos, el microservicio implementa:
* **Autenticación Delegada (Zero-Knowledge):** El backend no almacena contraseñas. Delega la validación criptográfica del token a Google Firebase.
* **Helmet y CORS Estricto:** Oculta cabeceras HTTP sensibles y restringe las peticiones API estrictamente a los dominios oficiales (`fococero.cl` y `localhost`), mitigando ataques XSS, Clickjacking y robo de datos desde clones web.
* **Rate Limiting (Anti-DDoS):** Bloquea direcciones IP que intenten realizar ataques de fuerza bruta o saturación (límite de 50 peticiones cada 15 minutos en rutas de autenticación).

---

## 📖 Documentación Interactiva (Swagger)
El microservicio cuenta con una interfaz gráfica autogenerada para que los equipos de Frontend y Mobile puedan explorar y probar los endpoints de manera visual.
* **Ruta de acceso:** `/api/docs` (Ej: `http://localhost:3001/api/docs`)

---

## ⚙️ Calidad de Código e Integración Continua (CI/CD)
* **Linter y Formateador:** Configurado con **ESLint** y **Prettier** para mantener un estilo de código estandarizado y libre de "code smells".
* **GitHub Actions:** Pipeline automatizado que se ejecuta con cada `push` o `pull_request`. Descarga dependencias, revisa el estilo de código (linting), compila TypeScript y ejecuta la suite de pruebas (Jest) antes de permitir integraciones a la rama principal.

---

## 📊 Base de Datos y Tablas
Utiliza **PostgreSQL**. La tabla principal gestionada por este módulo es `usuarios`. Cuenta con un script `init.sql` para automatizar las migraciones en producción.
Los campos clave incluyen:
* `id` (PK)
* `rut` (Único, estandarizado)
* `firebase_uid` (Vínculo unívoco con la cuenta de Google/Firebase)
* `fcm_token` (Token del celular para enviar notificaciones Push)
* `rol` (Enum: invitado, usuario, brigadista, admin)
* `estado` (Enum: activo, bloqueado, suspendido)

---

## 🐳 Contenerización y Despliegue (Docker)
El proyecto está preparado para la nube mediante un `Dockerfile` de **Múltiples Etapas (Multi-stage build)** y rutinas de **Graceful Shutdown**:
1. **Apagado Elegante:** Al recibir una señal `SIGTERM` (ej. reinicio en AWS/Docker), el servidor detiene el tráfico HTTP y cierra las conexiones al pool de PostgreSQL de forma segura para no dejar transacciones colgadas.
2. **Builder Stage:** Descarga dependencias de desarrollo y compila TypeScript a JavaScript.
3. **Production Stage:** Utiliza una imagen ligera (`node:20-alpine`), copia únicamente los binarios compilados y dependencias de producción, reduciendo el peso y la superficie de ataque.

---

## 📂 Arquitectura de Carpetas (Clean Architecture)

El proyecto sigue una arquitectura en capas altamente escalable dentro de `src/`:

1. **`/@types`**: Extensiones de tipado global para TypeScript.
2. **`/config`**: Inicialización de variables de entorno, base de datos y Firebase.
3. **`/controllers`**: Capa de presentación HTTP.
4. **`/docs`**: Contiene `swagger.json` con la definición OpenAPI interactiva.
5. **`/helpers`**: Utilidades puras (Ej: formateo y validación Módulo 11 del RUT).
6. **`/middlewares`**: Interceptores de tráfico (Validación de tokens y manejo global de errores).
7. **`/models`**: Interfaces y Enums de TypeScript.
8. **`/repositories`**: Capa de datos (Consultas SQL a PostgreSQL).
9. **`/routes`**: Enrutador de Express.
10. **`/services`**: Lógica central de negocio.
11. **`/validators`**: Validación de entrada de datos (Input Validation).

---
