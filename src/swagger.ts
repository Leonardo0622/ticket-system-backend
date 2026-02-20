const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Ticket System API",
    version: "1.0.0",
    description: "API para gestionar tickets y autenticación con roles",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      UserRegister: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string" },
          role: { type: "string", description: "Rol del usuario, p.ej. admin o user" }
        },
        required: ["email", "password"],
      },
      AuthLogin: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" }
        },
        required: ["email", "password"],
      },
      Ticket: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      TicketCreate: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" }
        },
        required: ["title", "description"]
      }
    }
  },
  tags: [
    { name: "Auth", description: "Endpoints de autenticación" },
    { name: "Tickets", description: "Endpoints para tickets" }
  ],
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar un nuevo usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRegister" }
            }
          }
        },
        responses: {
          "201": { description: "Usuario creado" },
          "400": { description: "Datos inválidos" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesión y recibir JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthLogin" }
            }
          }
        },
        responses: {
          "200": { description: "Token devuelto" },
          "401": { description: "Credenciales inválidas" }
        }
      }
    },
    "/api/tickets": {
      get: {
        tags: ["Tickets"],
        summary: "Listar tickets (requiere autenticación)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de tickets",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Ticket" } } } }
          },
          "401": { description: "No autorizado" }
        }
      },
      post: {
        tags: ["Tickets"],
        summary: "Crear un ticket (requiere autenticación)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TicketCreate" } } }
        },
        responses: {
          "201": { description: "Ticket creado" },
          "400": { description: "Datos inválidos" },
          "401": { description: "No autorizado" }
        }
      }
    }
  }
};

export default swaggerSpec;
