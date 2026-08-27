# AGENTS.md

Compact guidance for working in this repo. Read README.md and `opencode.json` for more.

## Repository shape
- Two independent npm projects, not a monorepo with workspaces:
  - **Root** = backend (Node + Express + TypeScript + Mongoose/MongoDB). `"type": "commonjs"`.
  - **`client/`** = frontend (React + Vite + TypeScript). `"type": "module"`.
- Each has its own `package.json` and needs its own `npm install`.
- Root `tsconfig.json` `include`s only `src/**/*` and explicitly `exclude`s `client` — the frontend is compiled by Vite, not `tsc`.

## Backend commands
- `npm run dev` — `nodemon --exec tsx src/server.ts` (hot reload, no build step).
- `npm run build` — `tsc` only; emits CommonJS to `dist/`. No bundler.
- `npm start` — `node dist/server.js` (requires a prior `build`).
- There is **no `test`, `lint`, or `typecheck` script** configured in either package.json. Do not expect `npm test` / `npm run lint` to exist.

## Environment setup (gotcha)
- `src/config/db.ts` reads `process.env.MONGO_URI`. The committed `.env.example` lists `DATABASE_URL` instead — that is **stale/wrong**, do not copy it verbatim.
- Required `.env` (root): `PORT` (default 3000), `MONGO_URI`, `JWT_SECRET`.
- `dotenv.config()` runs at the top of `src/server.ts`, so env must be set before the server process starts.

## Full-stack dev
- Backend listens on `:3000`; Swagger UI at `/api/docs`.
- Frontend `client/` runs `npm run dev` on `:5173` and proxies `/api` → `http://localhost:3000` (see `client/vite.config.ts`). Run both for end-to-end work.

## Backend architecture (entrypoints)
- `src/server.ts` — bootstrap: loads dotenv, connects DB, starts `app.listen`.
- `src/app.ts` — Express app wiring (Helmet, CORS, Morgan, routes, swagger).
- Layered: `routes/` → `controllers/` → `services/` → `models/` (Mongoose).
- `validators/` hold Zod schemas; enforced by `middlewares/validate.middleware.ts`.
- Auth: `middlewares/auth.middleware.ts` (JWT Bearer) and `middlewares/role.middleware.ts`.
- Roles: `admin`, `agent`, `user` (types in `src/types/role.ts`). Permission rules are in README.md — preserve them when touching ticket logic.

## Git quirks
- `.gitignore` ignores `README.md` and `testsprite_tests/tmp/`. Edits to README.md will **not** be committed by default.
- `opencode.json` registers the TestSprite MCP; its TestSprite artifacts live in `testsprite_tests/`.
