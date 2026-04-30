# Tasks: Team Task Management Web Application

## Overview

Implementation tasks derived from the design and requirements. The backend is already scaffolded with all four route groups (auth, projects, tasks, dashboard) and Prisma schema. The primary work is building the React frontend SPA and wiring up Railway deployment.

---

## Tasks

- [x] 1 Set up React frontend foundation
  - [x] 1.1 Convert `frontend/src/main.ts` to `main.tsx` and bootstrap React with `ReactDOM.createRoot`
  - [x] 1.2 Install React and type definitions (`react`, `react-dom`, `@types/react`, `@types/react-dom`)
  - [x] 1.3 Update `frontend/tsconfig.json` to include `"jsx": "react-jsx"` and update `include` to cover `.tsx` files
  - [x] 1.4 Update `frontend/index.html` to reference `main.tsx`
  - [x] 1.5 Create `frontend/src/App.tsx` with React Router `BrowserRouter` and route definitions
  - [x] 1.6 Replace `frontend/src/style.css` with base Tailwind CSS directives (`@tailwind base/components/utilities`)

- [x] 2 Implement API client and Auth context
  - [x] 2.1 Create `frontend/src/lib/api.ts` — axios instance with `VITE_API_URL` base URL, request interceptor to attach Bearer token, response interceptor to handle 401 (clear token + redirect to `/login`)
  - [x] 2.2 Create `frontend/src/context/AuthContext.tsx` — context providing `user`, `token`, `login()`, `signup()`, `logout()`; persist token to `localStorage`
  - [x] 2.3 Create `frontend/src/components/ProtectedRoute.tsx` — wrapper that redirects unauthenticated users to `/login`

- [x] 3 Build authentication pages
  - [x] 3.1 Create `frontend/src/pages/LoginPage.tsx` — email/password form, calls `AuthContext.login()`, shows API validation errors inline, redirects to `/projects` on success
  - [x] 3.2 Create `frontend/src/pages/SignupPage.tsx` — name/email/password form, calls `AuthContext.signup()`, shows API validation errors inline, redirects to `/projects` on success

- [x] 4 Build projects pages
  - [x] 4.1 Create `frontend/src/pages/ProjectsPage.tsx` — fetches and lists user's projects (name, role badge, member count, task count); includes "Create Project" button
  - [x] 4.2 Create `frontend/src/components/CreateProjectModal.tsx` — modal form with name and description fields; calls `POST /api/projects`; closes and refreshes list on success

- [x] 5 Build project detail page
  - [x] 5.1 Create `frontend/src/pages/ProjectDetailPage.tsx` — fetches project by ID; renders task list, members panel, and navigation to dashboard
  - [x] 5.2 Create `frontend/src/components/TaskList.tsx` — renders tasks with title, status badge, priority badge, due date, assignee; conditionally shows admin controls (edit/delete) or member status dropdown
  - [x] 5.3 Create `frontend/src/components/TaskModal.tsx` — create/edit form with title, description, status, priority, due date, assignee (dropdown of project members); ADMIN only
  - [x] 5.4 Create `frontend/src/components/MembersPanel.tsx` — lists members with role; ADMIN sees "Add Member" (by email) and "Remove" buttons; calls respective API endpoints

- [-] 6 Build dashboard page
  - [-] 6.1 Create `frontend/src/pages/DashboardPage.tsx` — fetches `GET /api/dashboard/:projectId`; renders stats cards and tables
  - [ ] 6.2 Create `frontend/src/components/StatsCard.tsx` — reusable card showing a label and numeric value (used for total tasks, overdue count)
  - [ ] 6.3 Render tasks-by-status breakdown as a visual grid of status cards (TODO / IN_PROGRESS / DONE counts)
  - [ ] 6.4 Render tasks-per-user as a table with user name and task count

- [x] 7 Shared UI components and layout
  - [x] 7.1 Create `frontend/src/components/Layout.tsx` — app shell with sidebar (project list nav, logout button) and main content area
  - [x] 7.2 Create `frontend/src/components/Sidebar.tsx` — lists user's projects; highlights active project; links to project detail and dashboard
  - [x] 7.3 Create `frontend/src/components/Badge.tsx` — reusable colored badge for status (`TODO`=gray, `IN_PROGRESS`=blue, `DONE`=green) and priority (`LOW`=green, `MEDIUM`=yellow, `HIGH`=red)

- [ ] 8 Backend verification and hardening
  - [ ] 8.1 Verify `backend/src/lib/prisma.js` exports a singleton Prisma client (create if missing)
  - [ ] 8.2 Add `prisma generate` to the Railway build command in `backend/package.json` (`"build": "prisma generate"`)
  - [ ] 8.3 Verify all route files are correctly required in `backend/src/index.js` and that the task routes mount at `/api`

- [ ] 9 Railway deployment configuration
  - [ ] 9.1 Create `backend/railway.toml` (or verify `package.json` start script) — start command: `npx prisma migrate deploy && node src/index.js`
  - [ ] 9.2 Create `frontend/vite.config.ts` if not present — configure build output directory and ensure `VITE_API_URL` is read from env
  - [ ] 9.3 Document required environment variables in a `README.md` at the workspace root: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` (backend); `VITE_API_URL` (frontend)

- [ ] 10 End-to-end wiring and smoke testing
  - [ ] 10.1 Verify the full auth flow works in the browser: signup → login → `/me` → logout
  - [ ] 10.2 Verify project creation auto-assigns ADMIN role and the project appears in the list
  - [ ] 10.3 Verify task creation (admin), status update (member on own task), and 403 on unauthorized actions
  - [ ] 10.4 Verify dashboard aggregation matches actual task data in the database
