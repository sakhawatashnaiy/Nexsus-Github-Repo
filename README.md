# Nexsus Platform

Nexsus is a full‑stack (frontend + backend) SaaS-style platform built during an internship project.
It includes authentication, a dashboard shell (sidebar + topbar), and feature areas like projects, documents, meetings, and payments.

## Repo structure

- `backend/` — Node.js + Express API (TypeScript) + MongoDB
- `frontend/` — React (Vite) single-page app (TypeScript) + Tailwind

## Tech stack (high level)

**Backend**
- Express + TypeScript
- MongoDB + Mongoose
- JWT auth (access + refresh)
- Security middlewares (helmet, rate limiting, mongo-sanitize, hpp)
- File uploads with Multer (local storage)
- Socket.IO (real-time signaling)

**Frontend**
- React + Vite + TypeScript
- TailwindCSS
- Redux Toolkit + RTK Query
- React Router
- React Hook Form + Zod

## Quick start (local)

### Prerequisites

- Node.js (LTS recommended) + npm
- A MongoDB instance (local or Atlas)

### 1) Backend

```bash
cd backend
npm install
```

Create `backend/.env` (see the template below), then run:

```bash
npm run dev
```

The API will start on `PORT` (defaults to **3000**) and exposes:
- `GET /health`
- API base: `http://localhost:<PORT>/api`

### 2) Frontend

```bash
cd frontend
npm install
```

Set the API URL:

> Note: the current `frontend/.env.example` points to port **3001**, while the backend defaults to **3000**.
> Either change `VITE_API_BASE_URL` to `3000`, or set `PORT=3001` in `backend/.env`.

```bash
copy .env.example .env.local
# macOS/Linux: cp .env.example .env.local
```

Update `VITE_API_BASE_URL` in `frontend/.env.local` to match your backend port, for example:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

Then run:

```bash
npm run dev
```

## Environment variables

### Backend (`backend/.env`)

These are validated at startup in `backend/src/config/env.ts`.

**Required**

- `MONGODB_URI` — MongoDB connection string
- `JWT_ACCESS_SECRET` — at least 16 characters
- `JWT_REFRESH_SECRET` — at least 16 characters

**Common / optional**

- `NODE_ENV` — `development` | `test` | `production` (default: `development`)
- `PORT` — API port (default: `3000`)
- `JWT_ACCESS_EXPIRES_IN` (default: `15m`)
- `JWT_REFRESH_EXPIRES_IN` (default: `30d`)
- `BCRYPT_SALT_ROUNDS` (default: `10`)
- `LOG_AUTH_TIMINGS` — `true`/`false` (default: `false`)
- `CORS_ORIGIN` — comma-separated allowlist (default includes local Vite + `https://*.vercel.app`)
- `COOKIE_SECURE` — `true`/`false` (default: `false`)
- `UPLOAD_PROVIDER` — `local` | `cloudinary` (default: `local`)
- `UPLOAD_DIR` — local upload folder (default: `uploads`)
- `PAYMENT_PROVIDER` — `mock` | `stripe` | `paypal` (default: `mock`)
- `STRIPE_SECRET_KEY` — required if using Stripe
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` — required if using PayPal

A simple working example:

```env
NODE_ENV=development
PORT=3000

MONGODB_URI=mongodb://127.0.0.1:27017/nexsus

JWT_ACCESS_SECRET=replace-with-a-long-random-string
JWT_REFRESH_SECRET=replace-with-a-long-random-string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

BCRYPT_SALT_ROUNDS=10
LOG_AUTH_TIMINGS=false

CORS_ORIGIN=http://localhost:5173
COOKIE_SECURE=false

UPLOAD_PROVIDER=local
UPLOAD_DIR=uploads

PAYMENT_PROVIDER=mock
```

Tip (quick secret generator):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend (`frontend/.env.local`)

- `VITE_API_BASE_URL` — your backend API base URL

Example:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Useful scripts

### Backend

From `backend/`:

- `npm run dev` — run the API in watch mode
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run `dist/server.js`

### Frontend

From `frontend/`:

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run typecheck` — TypeScript typecheck only
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run format` — Prettier

## API notes

- All routes are mounted under `/api` (see `backend/src/app.ts`).
- Current route groups include: `/auth`, `/dashboard`, `/projects`, `/documents`, `/meetings`, `/payments`.
- Static uploads (local) are served from `/uploads`.

---

If you want, I can also add a small `backend/.env.example` (safe template only) so new devs don’t have to guess the env keys.