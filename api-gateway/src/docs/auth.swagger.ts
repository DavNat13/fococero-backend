export const authPaths = {
  "/api/auth/register-guest": {
    post: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Registro Invitado (Sin Firebase)",
      requestBody: {
        description:
          "Datos cívicos necesarios para registrar a un ciudadano invitado.",
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
        "400": { description: "Error en los datos o RUT inválido" },
      },
    },
  },
  "/api/auth/register-full": {
    post: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Registro Completo (Con Firebase)",
      requestBody: {
        description:
          "Requiere el token JWT entregado por Google/Firebase en el frontend.",
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["rut", "nombre", "apellido", "telefono", "token"],
              properties: {
                rut: { type: "string", example: "12345678-5" },
                nombre: { type: "string", example: "David" },
                apellido: { type: "string", example: "Pérez" },
                telefono: { type: "string", example: "+56912345678" },
                token: { type: "string", example: "eyJhbGciOiJSUzI1NiIs..." },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Cuenta FocoCero creada con éxito" },
        "400": { description: "Token inválido o identidad duplicada" },
      },
    },
  },
  "/api/auth/me": {
    get: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Ver mi Perfil",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Perfil obtenido con éxito" },
        "404": { description: "Usuario no encontrado en la base de datos" },
      },
    },
    patch: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Actualizar Perfil",
      security: [{ bearerAuth: [] }],
      requestBody: {
        description: "Campos opcionales a modificar",
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                rut: { type: "string", example: "12345678-5" },
                nombre: { type: "string", example: "David Modificado" },
                apellido: { type: "string", example: "Pérez" },
                telefono: { type: "string", example: "+56911111111" },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Perfil actualizado" },
        "400": { description: "Error de validación o RUT duplicado" },
      },
    },
  },
  "/api/auth/me/fcm-token": {
    patch: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Sincronizar Token Push",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["fcm_token"],
              properties: {
                fcm_token: { type: "string", example: "eXamPleT0k3n_FCM..." },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Canal de alertas push sincronizado" },
        "400": { description: "Token de notificación inválido" },
      },
    },
  },
  "/api/auth/users": {
    get: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Listar Usuarios (ADMIN)",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Lista de usuarios obtenida" },
      },
    },
  },
  "/api/auth/users/{id}/role": {
    patch: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Cambiar Rol (ADMIN)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "integer" },
          description: "ID del usuario",
        },
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
                  example: "brigadista",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Rol actualizado exitosamente" },
        "400": { description: "El rol proporcionado no es válido" },
      },
    },
  },
  "/api/auth/users/{id}/status": {
    patch: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Cambiar Estado (ADMIN)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "integer" },
          description: "ID del usuario",
        },
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
                  example: "bloqueado",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Estado operativo modificado" },
        "400": { description: "Estado de usuario no reconocido" },
      },
    },
  },
  "/api/auth/users/{id}": {
    delete: {
      tags: ["Autenticación (ms-auth)"],
      summary: "Eliminar Usuario (ADMIN)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "integer" },
          description: "ID del usuario a eliminar",
        },
      ],
      responses: {
        "200": { description: "Usuario eliminado definitivamente" },
        "400": { description: "Imposible eliminar: Usuario no encontrado" },
      },
    },
  },
};
