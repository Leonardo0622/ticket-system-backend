# PRD — Ticket System

## What it does

A full-stack ticket management system where users can register, log in, and manage support tickets.

**Frontend:** React 18 + Vite + React Router v6 + TanStack Query + shadcn/ui (Tailwind)
**Backend:** Express 5 + TypeScript + MongoDB (Mongoose) + JWT auth + Zod validation + Swagger docs

## Features

- User registration and login (JWT authentication)
- Create, view, and manage tickets (protected routes)
- Dark/light mode toggle
- Responsive UI with shadcn/ui components
- Swagger API documentation at `/api/docs`

## Routes

### Client-side (SPA)
| Path | Description | Auth |
|------|-------------|------|
| `/` | Redirects to `/tickets` | No |
| `/login` | Login page | No |
| `/register` | Registration page | No |
| `/tickets` | Tickets list (main view) | Yes |

### API
| Path | Description |
|------|-------------|
| `/api/auth/register` | User registration |
| `/api/auth/login` | User login |
| `/api/tickets/*` | Ticket CRUD operations |
| `/api/docs` | Swagger documentation |

## What TestSprite needs to test

### Authentication flow
- Register a new user with valid data
- Login with valid credentials
- Login with invalid credentials (should show error)
- Access protected route without token (should redirect to `/login`)

### Ticket management
- Create a new ticket (authenticated)
- View ticket list
- Verify tickets belong to the logged-in user

### UI / Navigation
- Navigate between pages via React Router
- Refresh page on protected routes (F5) — should not 404
- Dark/light mode toggle works

### API
- All `/api/auth/*` endpoints respond correctly
- All `/api/tickets/*` endpoints require valid JWT
- Swagger docs load at `/api/docs`

### Environment
- Frontend runs on port **5173** (Vite dev server)
- Backend runs on port **3000** (Express)
- Backend requires MongoDB connection
