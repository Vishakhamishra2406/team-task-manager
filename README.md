# Team Task Management App

A full-stack collaborative task management web application built with Node.js, Express, Prisma, React, and TypeScript.

## Features

- JWT authentication (signup / login)
- Create projects — creator becomes Admin
- Admin: manage members, create/edit/delete tasks
- Member: view projects, update status on assigned tasks
- Dashboard with task stats, status breakdown, overdue count, tasks per user

## Tech Stack

- **Backend**: Node.js, Express 5, Prisma ORM, PostgreSQL
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Auth**: JWT (7-day expiry), bcryptjs

---

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Backend

```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npx prisma migrate deploy
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env   # fill in VITE_API_URL
npm install
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                              | Example                          |
|----------------|------------------------------------------|----------------------------------|
| `DATABASE_URL` | PostgreSQL connection string             | `postgresql://user:pass@host/db` |
| `JWT_SECRET`   | Secret key for signing JWTs             | `a-long-random-string`           |
| `FRONTEND_URL` | Frontend origin for CORS                | `https://your-app.up.railway.app`|
| `PORT`         | Port to listen on (Railway sets this)   | `5000`                           |

### Frontend (`frontend/.env`)

| Variable        | Description                  | Example                               |
|-----------------|------------------------------|---------------------------------------|
| `VITE_API_URL`  | Backend API base URL         | `https://your-backend.up.railway.app` |

---

## Deployment (Railway)

1. Create a new Railway project
2. Add a **PostgreSQL** plugin — Railway sets `DATABASE_URL` automatically
3. Add a **Backend** service from the `backend/` folder:
   - Set env vars: `JWT_SECRET`, `FRONTEND_URL`
   - Railway uses `backend/railway.toml` for build/start commands
4. Add a **Frontend** service from the `frontend/` folder:
   - Set env var: `VITE_API_URL` = your backend Railway URL
   - Railway uses `frontend/railway.toml` for build/start commands
5. Deploy — migrations run automatically on backend start

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | — | Register |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/projects` | ✓ | List my projects |
| POST | `/api/projects` | ✓ | Create project |
| GET | `/api/projects/:id` | ✓ | Project detail |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member by email |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |
| GET | `/api/projects/:id/tasks` | Member | List tasks |
| POST | `/api/projects/:id/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Member/Admin | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |
| GET | `/api/dashboard/:projectId` | Member | Dashboard stats |
