// api-gateway/src/docs/auth.swagger.ts

export const authPaths = {
  // ============================================================================
  // 🔓 ZONA PÚBLICA (Registro)
  // ============================================================================
  "/api/auth/register-guest": {
    post: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Registro Invitado (Rápido)",
      description:
        "Registra a un ciudadano sin cuenta de Firebase utilizando solo su RUT y datos de contacto.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["rut", "nombre", "apellido", "telefono"],
              properties: {
                rut: { type: "string", example: "12345678-5" },
                nombre: { type: "string", example: "David" },
                apellido: { type: "string", example: "Pérez" },
                telefono: { type: "string", example: "+56912345678" },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Invitado registrado exitosamente" },
        "200": { description: "Usuario ya identificado en el sistema" },
      },
    },
  },
  "/api/auth/register-full": {
    post: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Registro Completo (Cuenta FocoCero)",
      description: "Crea una cuenta completa vinculada a un Firebase UID.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["rut", "nombre", "apellido", "email", "firebase_uid"],
              properties: {
                rut: { type: "string", example: "12345678-5" },
                nombre: { type: "string", example: "Ana" },
                apellido: { type: "string", example: "Gómez" },
                email: { type: "string", format: "email" },
                firebase_uid: { type: "string" },
                telefono: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Cuenta creada con éxito" },
        "409": { description: "Conflicto - El RUT o Email ya existe" },
      },
    },
  },

  // ============================================================================
  // 🔒 ZONA PRIVADA (Mi Perfil)
  // ============================================================================
  "/api/auth/me": {
    get: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Obtener mi perfil",
      description: "Devuelve los datos del usuario autenticado actualmente.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Perfil obtenido" },
      },
    },
    patch: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Actualizar mi perfil",
      description:
        "Permite al usuario modificar sus datos de contacto básicos.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                nombre: { type: "string" },
                apellido: { type: "string" },
                telefono: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Perfil actualizado correctamente" },
      },
    },
  },
  "/api/auth/me/fcm-token": {
    patch: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Sincronizar token FCM (Push Notifications)",
      description:
        "Actualiza el token de dispositivo para recibir alertas push.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["fcm_token"],
              properties: {
                fcm_token: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Token sincronizado" },
      },
    },
  },

  // ============================================================================
  // 🔴 ZONA ADMINISTRATIVA (Solo Admins)
  // ============================================================================
  "/api/auth/users": {
    get: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Listar Usuarios (ADMIN)",
      description:
        "Devuelve el catálogo completo de usuarios registrados en el sistema.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Lista de usuarios obtenida" },
        "403": { description: "Acceso denegado (Requiere rol Admin)" },
      },
    },
  },
  "/api/auth/users/{id}/role": {
    patch: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Cambiar Rol de Usuario (ADMIN)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: "path", name: "id", required: true, schema: { type: "integer" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["rol"],
              properties: {
                rol: {
                  type: "string",
                  enum: ["invitado", "usuario", "brigadista", "admin"],
                },
              },
            },
          },
        },
      },
      responses: { "200": { description: "Rol actualizado" } },
    },
  },
  "/api/auth/users/{id}/status": {
    patch: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Cambiar Estado de Usuario (ADMIN)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: "path", name: "id", required: true, schema: { type: "integer" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["estado"],
              properties: {
                estado: {
                  type: "string",
                  enum: ["activo", "bloqueado", "suspendido"],
                },
              },
            },
          },
        },
      },
      responses: { "200": { description: "Estado modificado" } },
    },
  },
  "/api/auth/users/{id}": {
    delete: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Eliminar Usuario (ADMIN)",
      description:
        "Realiza un borrado duro (Hard Delete) del registro de usuario.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: "path", name: "id", required: true, schema: { type: "integer" } },
      ],
      responses: { "200": { description: "Usuario eliminado" } },
    },
  },
};
