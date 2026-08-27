# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

---

## [1.0.0] - 2026-08-26

### Added

- **Backend (Node.js + Express + TypeScript + MongoDB)**
  - Autenticación JWT con contraseñas hasheadas (bcryptjs).
  - Validación de entrada con Zod en todos los endpoints.
  - API REST documentada con Swagger UI (`/api/docs`).
  - Control de permisos por rol: `admin`, `agent`, `user`.
  - Endpoints de autenticación: registro, login, logout, `/auth/me`.
  - Endpoints de tickets: crear, listar, obtener por ID, actualizar, eliminar, asignar a agente.
  - Gestión de usuarios: listar, actualizar, eliminar (solo admin).
  - Rate limiting en endpoints de login (10 intentos/15 min) y registro (5 intentos/hora).
  - Middleware de autenticación con soporte para HttpOnly cookies y Bearer token.
  - Middleware de autorización por rol (`authorizeRoles`).
  - Middleware de validación reutilizable para body, params y query.
  - Token revocation en memoria para cerrar sesiones de forma segura.
  - Conexión MongoDB con TLS habilitado en producción.

- **Frontend (React + Vite + TypeScript)**
  - Consumo del API con Axios y credenciales (cookies HttpOnly).
  - Rutas protegidas con React Router v6 y `AuthContext`.
  - Pantalla de Login (`/login`) con formulario validado.
  - Pantalla de Registro (`/register`) con formulario validado.
  - Pantalla de Tickets (`/tickets`) con lista, creación y gestión según rol.
  - Badges de color para prioridad (alta=rojo, media=naranja, baja=verde).
  - Badges de color para estado (abierto=gris, en progreso=azul, cerrado=verde).
  - Visualización del agente asignado (nombre y email).
  - Modo claro/oscuro con `next-themes`.
  - Notificaciones con Sonner.
  - UI moderna con Tailwind CSS 4, shadcn/Radix UI e iconos Lucide.
  - Proxy Vite configurado para redirigir `/api` al backend.

- **Seguridad (auditoría completa)**
  - Helmet habilitado con Content Security Policy (CSP) y HSTS.
  - Morgan para logging de requests HTTP.
  - Límite de tamaño de body (100kb) en `express.json()`.
  - Cookie-parser para manejo de cookies HttpOnly.
  - Swagger UI deshabilitado en producción (`NODE_ENV=production`).
  - Migración de JWT de localStorage a cookies HttpOnly (Secure, SameSite=Lax).
  - JWT con expiración de 1 hora (reducido de 1 día).
  - Rotación del secreto JWT (reemplazo de `super_secret_key` por secreto de 256-bit).
  - MongoDB TLS forzado en producción.
  - Headers de seguridad: `frameAncestors: none`, `objectSrc: none`.

### Changed

- **Autenticación**: el JWT ahora se envía como cookie HttpOnly en lugar de header `Authorization` (el header sigue siendo soportado como fallback).
- **Registro de usuarios**: el campo `role` ya no es aceptado en el registro; todos los usuarios nuevos se crean como `"user"`.
- **Política de contraseñas**: mínimo 8 caracteres con al menos una mayúscula, una minúscula y un número (antes era 6 caracteres sin complejidad).
- **Bcrypt salt rounds**: aumentados de 10 a 12 (recomendación OWASP).
- **Expiración JWT**: reducida de 1 día a 1 hora.
- **Schemas Zod**: todos los schemas ahora usan `.strict()` para rechazar campos inesperados.
- **Actualización de tickets**: schemas divididos por rol (user solo puede editar título/descripción, agent puede cambiar estado, admin tiene acceso completo).
- **Actualizar usuario**: endpoint `PUT /api/auth/users/:id` ahora requiere validación Zod y solo acepta campos permitidos (name, email, role).
- **Error messages**: todas las respuestas de error ahora son genéricas para evitar filtración de información interna.
- **Listar usuarios**: endpoint `GET /api/auth/users` ahora requiere rol `admin`.
- **Vite proxy**: configurado con `changeOrigin: true` para compatibilidad con cookies.
- **Client API**: eliminado interceptor de localStorage; ahora usa `withCredentials: true`.

### Fixed

- Vulnerabilidad de **privilege escalation**: el endpoint de registro ya no acepta el campo `role`.
- Vulnerabilidad de **mass assignment**: el endpoint `PUT /api/auth/users/:id` ahora valida y filtra campos permitidos.
- Secreto JWT predeterminado (`super_secret_key`) reemplazado por secreto seguro de 256-bit.
- `helmet` y `morgan` estaban instalados pero nunca aplicados; ahora están habilitados.
- `.env.example` listaba `DATABASE_URL` en lugar de `MONGO_URI`; corregido.
- `assignTicket` no verificaba autenticación del usuario en el controller; añadido check de defense-in-depth.
- Sin logging de requests HTTP; habilitado Morgan.
- Sin rate limiting en endpoints de autenticación; añadido.
- Sin límite de tamaño en `express.json()`; añadido (100kb).

### Removed

- Eliminado el uso de `localStorage` para almacenar tokens JWT en el frontend (migrado a cookies HttpOnly).
- Eliminado el campo `role` del schema de registro.
- Eliminado el envío del token JWT en el header `Authorization` como método principal (ahora es cookie; el header funciona como fallback).
