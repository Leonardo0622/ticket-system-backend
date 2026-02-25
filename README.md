istema minimal para gestión de tickets con autenticación JWT, roles y frontend en React/TypeScript.

## Resumen
- **Backend**: Node.js + Express + TypeScript + MongoDB (Mongoose), validaciones con `zod`, JWT para autenticación.
- **Frontend**: React + Vite + TypeScript (`client/`), consumo del API con Axios y React Query.
- **Roles soportados**: `admin`, `agent`, `user`.

## Autenticación y roles (API)
- **Registro**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login` (devuelve `{ token, user }`, donde `user.role` y `user._id` se usan en el front).
- El JWT se envía como **Bearer token** en el header `Authorization`.

## Endpoints principales de tickets
- `GET /api/tickets/list` — Listar tickets del usuario según su rol.
- `POST /api/tickets/create` — Crear ticket autenticado.
- `GET /api/tickets/:id` — Obtener un ticket por id (según permisos).
- `PUT /api/tickets/:id` — Actualizar ticket (descripción, estado, prioridad, etc., según rol/permisos).
- `DELETE /api/tickets/:id` — Eliminar ticket (según rol/permisos).
- `PATCH /api/tickets/:id/assign` — Asignar ticket a un agente (solo `admin`).
- **Docs Swagger**: `GET /api/docs` (Swagger UI) — probar endpoints desde el navegador.

## Reglas de permisos (negocio)

**Usuarios (`role = "user"`) pueden:**
- Crear tickets.
- Editar la **descripción** de sus propios tickets.
- Eliminar **solo** sus propios tickets.

**Usuarios (`role = "user"`) NO pueden:**
- Modificar la **prioridad** de sus tickets.
- Cambiar el **estado** de sus tickets (pendiente, en progreso, resuelto, etc.).

**Administradores (`role = "admin"`) pueden:**
- Crear, editar y eliminar **cualquier** ticket.
- Asignar tickets a agentes y modificar la prioridad.
- Cambiar el estado de los tickets.
- Gestionar usuarios (listar, actualizar, eliminar) vía `/api/auth/users`, etc.

Los **agentes (`role = "agent"`)** ven y gestionan principalmente los tickets asignados a ellos.

## Frontend (cliente React)

El frontend vive en la carpeta `client/` y se comunica con el backend usando un proxy Vite:
- Base del API en el front: `/api` (configurado en `client/vite.config.ts`).

### Tecnologías
- React 18 + TypeScript.
- Vite.
- React Router para navegación.
- React Query para fetching/cache de datos.
- Axios para llamadas HTTP.

### Pantallas principales
- **Login** (`/login`): formulario contra `POST /api/auth/login`.
- **Registro** (`/register`): formulario contra `POST /api/auth/register`.
- **Tickets** (`/tickets`):
  - Lista de tickets según el rol del usuario.
  - Formulario de creación de tickets.
  - Acciones condicionales según permisos:
    - Usuarios: editar descripción y eliminar **solo** sus propios tickets.
    - Admin: cambiar estado, prioridad, asignar a agentes, eliminar cualquier ticket.
  - Visual:
    - Prioridad con **badge de color** (alta = rojo, media = naranja, baja = verde).
    - Estado con **label estilizado** (pendiente = gris, en progreso = azul, resuelto = verde).
    - Asignado a: muestra el **nombre** del agente (y email) cuando está disponible.

## Cómo correrlo en desarrollo

### Backend
1. Instalar dependencias en la raíz del proyecto:

```bash
npm install
```

2. Crear archivo `.env` con al menos:

```bash
PORT=3000
MONGO_URI=<tu_mongodb_uri>
JWT_SECRET=<tu_secreto>
```

3. Levantar el backend en modo desarrollo:

```bash
npm run dev
```

El backend quedará en `http://localhost:3000` y la documentación en `http://localhost:3000/api/docs`.

### Frontend
1. Ir a la carpeta `client/` e instalar dependencias:

```bash
cd client
npm install
```

2. Levantar el frontend en modo desarrollo:

```bash
npm run dev
```

3. Abrir en el navegador:
- Frontend: `http://localhost:5173`
- El proxy de Vite redirige las llamadas a `/api` hacia `http://localhost:3000`.

## Notas para reclutadores
- Backend organizado en `src/` con separación clara entre `routes`, `controllers`, `services`, `models`, `validators`, `middlewares`.
- Validaciones con `zod`, seguridad con JWT y control de acceso por roles en middlewares/servicios.
- Frontend minimal pero funcional en React + TS que respeta las reglas de permisos (user vs admin) y consume el API real.
