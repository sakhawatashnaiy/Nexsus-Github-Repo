# Nexsus Frontend

This is the React (Vite) frontend for the Nexsus platform.
It’s a fairly standard SaaS-style single page app: auth, a dashboard shell (sidebar + topbar), and feature pages (projects, documents, meetings, payments).

## Stack

- React + Vite
- TypeScript (strict)
- TailwindCSS
- Redux Toolkit + RTK Query
- React Router v6
- React Hook Form + Zod
- Lucide icons

## Quick start

1) Install deps

```bash
npm install
```

2) Set API URL

- Copy `.env.example` to `.env.local`
- Update `VITE_API_BASE_URL`

Example:

```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

3) Run dev server

```bash
npm run dev
```

## Useful scripts

- `npm run dev` — start local dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run typecheck` — TypeScript typecheck only
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Folder layout (high level)

- `src/app/` — Redux store, typed hooks, app providers
- `src/services/api/` — RTK Query base API (`baseApi`)
- `src/features/` — feature modules (auth, dashboard, meetings, etc.)
- `src/components/ui/` — reusable UI primitives
- `src/components/layout/` — app shell (sidebar/topbar)
- `src/routes/` — route definitions + auth guard
- `src/pages/` — generic pages
- `src/utils/` — small helpers

## Backend expectations

The frontend expects a JSON API at `VITE_API_BASE_URL`.
Typical endpoints used by the UI:

- `POST /auth/login` → `{ user, tokens }`
- `POST /auth/register` → `{ user, tokens }`
- `GET /auth/me` → `user`
- `GET /dashboard/stats` → dashboard stats
- `GET /projects` → list
- `POST /projects` → create
- `PATCH /projects/:id` → update
- `DELETE /projects/:id` → delete
