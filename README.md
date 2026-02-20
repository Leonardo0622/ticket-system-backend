# Ticket System — README PRO

Resumen
- Sistema minimal para gestión de tickets con autenticación JWT y roles (p. ej. `admin`, `user`). Permite registrar/entrar usuarios y crear/listar tickets.

Autenticación y roles
- Autenticación: JWT mediante `/api/auth/login` (recibirás un token Bearer).
- Registro: `/api/auth/register`.
- Roles: el sistema soporta asignar roles (por ejemplo `admin` o `user`) para controlar acceso a rutas protegidas.

Endpoints principales
- `POST /api/auth/register` — Registrar usuario.
- `POST /api/auth/login` — Login; devuelve JWT.
- `GET /api/tickets` — Listar tickets (requiere token Bearer).
- `POST /api/tickets` — Crear ticket (requiere token Bearer).
- Documentación interactiva: `GET /api/docs` (Swagger UI) — probar desde el navegador.

Cómo correrlo (desarrollo)
1. Instalar dependencias:

```bash
npm install
```

2. Crear archivo `.env` con al menos:

```
PORT=3000
MONGO_URI=<tu_mongodb_uri>
JWT_SECRET=<tu_secreto>
```

3. Ejecutar en modo desarrollo:

```bash
npm run dev
```

4. Abrir en el navegador:

- API: http://localhost:3000
- Docs interactivos: http://localhost:3000/api/docs

Notas para reclutadores
- El proyecto está estructurado en `src/` con separación clara: `routes`, `controllers`, `services`, `models`, `validators`, `middlewares`.
- Validaciones usan `zod` y la seguridad por JWT.
- Para una demo rápida, registre un usuario, haga login y use el token en el botón "Authorize" de Swagger UI.

¿Quieres que actualice la especificación OpenAPI con más detalles (esquemas de respuesta, ejemplos, o todos los endpoints existentes)?
