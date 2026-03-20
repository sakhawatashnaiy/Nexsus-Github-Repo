# Nexus Frontend

Production-ready React frontend scaffold for a real-world SaaS platform.

## Tech

- React + Vite
- TypeScript (strict)
- TailwindCSS (CSS-first)
- Redux Toolkit + RTK Query
- React Router v6
- React Hook Form + Zod
- Lucide React icons

## Getting started

1) Install dependencies

```bash
npm install
```

2) Configure environment

- Copy `.env.example` to `.env.local`
- Set `VITE_API_BASE_URL`

3) Run dev server

```bash
npm run dev
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run typecheck`
- `npm run format`

## Project structure

- `src/app/` store, typed hooks, providers
- `src/services/api/` centralized RTK Query `baseApi`
- `src/features/` feature modules (`auth`, `dashboard`, `projects`)
- `src/components/ui/` reusable UI primitives
- `src/components/layout/` sidebar/topbar shell
- `src/routes/` routing + auth guard
- `src/pages/` generic pages
- `src/utils/` utilities

## Backend expectations

This frontend expects a JSON API under `VITE_API_BASE_URL` with endpoints like:

- `POST /auth/login` -> `{ user, tokens }`
- `POST /auth/register` -> `{ user, tokens }`
- `GET /auth/me` -> `user`
- `GET /dashboard/stats` -> dashboard stats
- `GET /projects` -> list
- `POST /projects` -> create
- `PATCH /projects/:id` -> update
- `DELETE /projects/:id` -> delete
