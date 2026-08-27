Ticket System
Sistema minimal para gestión de tickets con autenticación JWT, roles y frontend en React/TypeScript.

Resumen
Backend: Node.js + Express 5 + TypeScript + MongoDB (Mongoose 9)
Autenticación JWT con cookies HttpOnly ( Secure, SameSite=Lax ) y contraseñas hasheadas con bcryptjs (12 rounds).
Validaciones de entrada con Zod (.strict() en todos los schemas).
API REST documentada con Swagger UI (/api/docs, deshabilitado en producción).
Control de permisos según rol: admin, agent, user.
Rate limiting en endpoints de autenticación (login: 10/15min, registro: 5/hr).
Token revocation para cerrar sesiones de forma segura.
Seguridad: Helmet (CSP + HSTS), CORS, Morgan, cookie-parser, body limit 100kb.
MongoDB con TLS habilitado en producción.
Frontend: React 18 + Vite 6 + TypeScript
Consumo del API con Axios y credenciales (cookies HttpOnly).
Rutas protegidas con React Router v6 y AuthContext.
UI moderna con Tailwind CSS 4 + shadcn/Radix UI.
Modo claro/oscuro con next-themes.
Notificaciones con Sonner.
Iconos Lucide.
Roles soportados: admin, agent, user.

Autenticación y roles (API)
Registro
POST /api/auth/register
Content-Type: application/json

{
  "name": "Leonardo",
  "email": "leo@gmail.com",
  "password": "Leo1234"
}
Nota: El campo role no es aceptado. Todos los usuarios se crean como "user". Política de contraseña: mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número.

Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "leo@gmail.com",
  "password": "Leo1234"
}
Respuesta: { "user": { "_id, name, email, role, ... } } — el token JWT se envía como cookie HttpOnly automáticamente.

Logout
POST /api/auth/logout
Obtener usuario actual
GET /api/auth/me
Cookie: token=<jwt>
Endpoints principales de tickets
Método	Endpoint	Descripción	Rol requerido
POST	/api/tickets/create	Crear ticket	Cualquier usuario autenticado
GET	/api/tickets/list	Listar tickets según rol	Cualquier usuario autenticado
GET	/api/tickets/:id	Obtener ticket por ID	Según permisos
PUT	/api/tickets/:id	Actualizar ticket	Según rol y permisos
DELETE	/api/tickets/:id	Eliminar ticket	Según rol
PATCH	/api/tickets/:id/assign	Asignar ticket a agente	Solo admin
GET	/api/docs	Swagger UI (solo dev)	Público (solo desarrollo)
Reglas de permisos (negocio)
Usuarios (role = "user")
Pueden:

Crear tickets.
Editar título y descripción de sus propios tickets.
Eliminar sus propios tickets.
NO pueden:

Modificar prioridad, estado o asignación de sus tickets.
Ver tickets de otros usuarios.
Agentes (role = "agent")
Ven y gestionan los tickets asignados a ellos.
Pueden cambiar el estado de sus tickets asignados.
NO pueden eliminar tickets ni modificar prioridad.
Administradores (role = "admin")
Crear, editar y eliminar cualquier ticket.
Cambiar estado, prioridad y asignación de tickets.
Gestionar usuarios (listar, actualizar, eliminar) vía /api/auth/users.
Seguridad
Medida	Estado
JWT en cookies HttpOnly	✅
Token revocation (logout server-side)	✅
Helmet (CSP + HSTS)	✅
Rate limiting en auth	✅
Body size limit (100kb)	✅
Validación Zod con .strict()	✅
Password policy (8+ chars, complejidad)	✅
Bcrypt 12 rounds	✅
MongoDB TLS en producción	✅
Swagger deshabilitado en producción	✅
Error messages genéricos	✅
Role hard-coded en registro	✅
Mass assignment protection	✅
Cómo correrlo en desarrollo
Backend
Instalar dependencias en la raíz del proyecto:
npm install
Crear archivo .env con al menos:
PORT=3000
MONGO_URI=<tu_mongodb_uri>
JWT_SECRET=<secreto_seguro_de_256_bit>
NODE_ENV=development
Levantar el backend en modo desarrollo:
npm run dev
El backend estará en http://localhost:3000 y la documentación en http://localhost:3000/api/docs.

Frontend
Ir a la carpeta client/ e instalar dependencias:
cd client
npm install
Levantar el frontend en modo desarrollo:
npm run dev
Abrir en el navegador:
Frontend: http://localhost:5173
El proxy de Vite redirige las llamadas a /api hacia http://localhost:3000.
Estructura del proyecto
ticket-system/
├── src/
│   ├── config/db.ts              # Conexión MongoDB
│   ├── controllers/              # Lógica de entrada
│   ├── middlewares/               # Auth, validación, roles
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # Express routes
│   ├── services/                 # Lógica de negocio
│   ├── types/                    # TypeScript types
│   ├── validators/               # Schemas Zod
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Entry point
│   └── swagger.ts                # Swagger config
├── client/
│   └── src/
│       ├── api/                  # Axios client
│       ├── auth/                 # AuthContext
│       ├── components/           # UI components
│       ├── pages/                # Login, Register, Tickets
│       └── lib/                  # Utilities
├── .env.example
├── .gitignore
├── CHANGELOG.md
├── PRD.md
├── package.json
└── tsconfig.json
