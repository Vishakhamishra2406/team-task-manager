# Requirements: Team Task Management Web Application

## Introduction

This document defines the functional and non-functional requirements for the Team Task Management Web Application. The system allows multiple users to collaborate on projects and tasks through a role-based web interface. The backend (Express + Prisma + PostgreSQL) is already scaffolded; the frontend (Vite + TypeScript) needs to be built as a React SPA.

---

## Requirements

### 1. User Authentication

#### 1.1 User Signup

**User Story**: As a new user, I want to create an account so that I can access the application.

**Acceptance Criteria**:

- [ ] 1.1.1 The system SHALL accept `name`, `email`, and `password` fields for signup via `POST /api/auth/signup`
- [ ] 1.1.2 The system SHALL reject signup if `email` is already registered, returning `400 { error: "Email already in use" }`
- [ ] 1.1.3 The system SHALL reject signup if `password` is fewer than 6 characters, returning `400` with a validation error
- [ ] 1.1.4 The system SHALL reject signup if `email` is not a valid email format, returning `400` with a validation error
- [ ] 1.1.5 On successful signup, the system SHALL return `201 { token, user: { id, name, email } }` where `token` is a signed JWT with 7-day expiry
- [ ] 1.1.6 The system SHALL store passwords as bcrypt hashes (never in plaintext)

**Correctness Properties**:
- For all valid `(name, email, password)` where email is unique: signup always returns a JWT decodable to `{ userId }` matching the created user's id
- For all signup requests with a duplicate email: response is always `400`

#### 1.2 User Login

**User Story**: As a registered user, I want to log in so that I can access my projects and tasks.

**Acceptance Criteria**:

- [ ] 1.2.1 The system SHALL accept `email` and `password` via `POST /api/auth/login`
- [ ] 1.2.2 The system SHALL return `400 { error: "Invalid credentials" }` if the email does not exist
- [ ] 1.2.3 The system SHALL return `400 { error: "Invalid credentials" }` if the password does not match the stored hash
- [ ] 1.2.4 On successful login, the system SHALL return `200 { token, user: { id, name, email } }`

**Correctness Properties**:
- For any registered user: login with correct credentials always returns a valid JWT
- For any login attempt with wrong password: response is always `400`

#### 1.3 Authentication Middleware

**User Story**: As the system, I need to protect all non-auth routes so that only authenticated users can access them.

**Acceptance Criteria**:

- [ ] 1.3.1 All routes except `POST /api/auth/signup`, `POST /api/auth/login`, and `GET /health` SHALL require a valid `Authorization: Bearer <token>` header
- [ ] 1.3.2 The system SHALL return `401 { error: "Authentication required" }` if the Authorization header is missing
- [ ] 1.3.3 The system SHALL return `401 { error: "Invalid token" }` if the token is expired or malformed
- [ ] 1.3.4 `GET /api/auth/me` SHALL return the authenticated user's `{ id, name, email }`

---

### 2. Project Management

#### 2.1 Create Project

**User Story**: As an authenticated user, I want to create a project so that I can organize tasks for my team.

**Acceptance Criteria**:

- [ ] 2.1.1 The system SHALL accept `name` (required) and `description` (optional) via `POST /api/projects`
- [ ] 2.1.2 The system SHALL reject project creation if `name` is empty, returning `400` with a validation error
- [ ] 2.1.3 On successful creation, the system SHALL create a `ProjectMember` record for the creator with `role = "ADMIN"` in the same operation
- [ ] 2.1.4 The response SHALL include `role: "ADMIN"` for the creating user

**Correctness Properties**:
- After any successful project creation, a `ProjectMember` record with `role = "ADMIN"` always exists for the creator

#### 2.2 List and View Projects

**User Story**: As a project member, I want to see my projects so that I can navigate to them.

**Acceptance Criteria**:

- [ ] 2.2.1 `GET /api/projects` SHALL return only projects where the authenticated user has a `ProjectMember` record
- [ ] 2.2.2 Each project in the list SHALL include `role` (the user's role in that project), `admin` info, and `_count` of members and tasks
- [ ] 2.2.3 `GET /api/projects/:id` SHALL return full project details including members list and tasks list
- [ ] 2.2.4 `GET /api/projects/:id` SHALL return `403` if the user is not a member of the project

#### 2.3 Update and Delete Project

**User Story**: As a project admin, I want to update or delete my project.

**Acceptance Criteria**:

- [ ] 2.3.1 `PUT /api/projects/:id` SHALL update `name` and/or `description` — ADMIN only
- [ ] 2.3.2 `DELETE /api/projects/:id` SHALL delete the project and cascade-delete all members and tasks — ADMIN only
- [ ] 2.3.3 Both operations SHALL return `403` if the requesting user is not an ADMIN of the project

#### 2.4 Member Management

**User Story**: As a project admin, I want to add and remove members so that I can control who has access.

**Acceptance Criteria**:

- [ ] 2.4.1 `POST /api/projects/:id/members` SHALL add a user by `email` — ADMIN only
- [ ] 2.4.2 The system SHALL return `404` if no user exists with the given email
- [ ] 2.4.3 The system SHALL return `400` if the user is already a member
- [ ] 2.4.4 `DELETE /api/projects/:id/members/:userId` SHALL remove a member — ADMIN only
- [ ] 2.4.5 The system SHALL return `400` if an admin attempts to remove themselves
- [ ] 2.4.6 Both operations SHALL return `403` if the requesting user is not an ADMIN

---

### 3. Task Management

#### 3.1 Create Tasks

**User Story**: As a project admin, I want to create tasks so that I can assign work to team members.

**Acceptance Criteria**:

- [ ] 3.1.1 `POST /api/projects/:projectId/tasks` SHALL accept `title` (required), `description`, `status`, `priority`, `dueDate`, `assignedToId`
- [ ] 3.1.2 The system SHALL reject task creation if `title` is empty, returning `400`
- [ ] 3.1.3 `status` SHALL default to `"TODO"` if not provided; valid values are `TODO`, `IN_PROGRESS`, `DONE`
- [ ] 3.1.4 `priority` SHALL default to `"MEDIUM"` if not provided; valid values are `LOW`, `MEDIUM`, `HIGH`
- [ ] 3.1.5 The system SHALL return `400` if `assignedToId` is provided but the user is not a member of the project
- [ ] 3.1.6 Task creation SHALL be restricted to ADMIN role; MEMBER gets `403`

**Correctness Properties**:
- For any valid task payload by an admin: task is created with the exact `status` and `priority` values provided (or defaults)
- For any invalid `status` or `priority` value: response is always `400`

#### 3.2 List Tasks

**User Story**: As a project member, I want to see all tasks in a project.

**Acceptance Criteria**:

- [ ] 3.2.1 `GET /api/projects/:projectId/tasks` SHALL return all tasks for the project, ordered by `createdAt` descending
- [ ] 3.2.2 Each task SHALL include `assignedTo: { id, name, email }` if assigned
- [ ] 3.2.3 The endpoint SHALL return `403` if the user is not a project member

#### 3.3 Update Tasks

**User Story**: As a user, I want to update tasks according to my role.

**Acceptance Criteria**:

- [ ] 3.3.1 `PUT /api/tasks/:id` SHALL allow ADMIN to update all fields: `title`, `description`, `status`, `priority`, `dueDate`, `assignedToId`
- [ ] 3.3.2 `PUT /api/tasks/:id` for a MEMBER SHALL only update `status`, and only on tasks assigned to them
- [ ] 3.3.3 The system SHALL return `403` if a MEMBER attempts to update a task not assigned to them
- [ ] 3.3.4 The system SHALL return `404` if the task does not exist
- [ ] 3.3.5 When an ADMIN changes `assignedToId`, the new assignee must be a project member; otherwise `400`

**Correctness Properties**:
- For any MEMBER: updating any task not assigned to them always returns `403`
- For any MEMBER: updating a task assigned to them only mutates the `status` field

#### 3.4 Delete Tasks

**User Story**: As a project admin, I want to delete tasks that are no longer needed.

**Acceptance Criteria**:

- [ ] 3.4.1 `DELETE /api/tasks/:id` SHALL delete the task — ADMIN only
- [ ] 3.4.2 The system SHALL return `403` if the user is not an ADMIN of the task's project
- [ ] 3.4.3 The system SHALL return `404` if the task does not exist

---

### 4. Dashboard

#### 4.1 Task Statistics

**User Story**: As a project member, I want to see a summary of task statistics so that I can understand project health.

**Acceptance Criteria**:

- [ ] 4.1.1 `GET /api/dashboard/:projectId` SHALL return `total` (integer count of all tasks in the project)
- [ ] 4.1.2 The response SHALL include `byStatus: [{ status, count }]` for each status that has at least one task
- [ ] 4.1.3 The response SHALL include `overdue` (count of tasks where `dueDate < now` AND `status !== "DONE"`)
- [ ] 4.1.4 The response SHALL include `tasksByUser: [{ user: { id, name, email }, count }]` for assigned tasks
- [ ] 4.1.5 The endpoint SHALL return `403` if the user is not a project member
- [ ] 4.1.6 All four data points SHALL be fetched in parallel (via `Promise.all`)

**Correctness Properties**:
- `total` always equals `sum(byStatus[*].count)` for any project state
- `overdue` always equals the count of tasks where `dueDate < now AND status !== "DONE"`
- `tasksByUser` only includes entries for tasks with a non-null `assignedToId`

---

### 5. Role-Based Access Control

#### 5.1 Admin Capabilities

**User Story**: As a project admin, I want full control over the project's tasks and members.

**Acceptance Criteria**:

- [ ] 5.1.1 ADMIN SHALL be able to create, update (all fields), and delete tasks
- [ ] 5.1.2 ADMIN SHALL be able to add and remove project members
- [ ] 5.1.3 ADMIN SHALL be able to update and delete the project itself
- [ ] 5.1.4 ADMIN SHALL be able to assign tasks to any project member

#### 5.2 Member Capabilities

**User Story**: As a project member, I want to view projects and update the status of my assigned tasks.

**Acceptance Criteria**:

- [ ] 5.2.1 MEMBER SHALL be able to view all projects they belong to
- [ ] 5.2.2 MEMBER SHALL be able to view all tasks in their projects
- [ ] 5.2.3 MEMBER SHALL be able to update `status` only on tasks assigned to them
- [ ] 5.2.4 MEMBER SHALL NOT be able to create, delete, or fully update tasks — returns `403`
- [ ] 5.2.5 MEMBER SHALL NOT be able to add or remove project members — returns `403`

**Correctness Properties**:
- For any MEMBER: any request that requires ADMIN role always returns `403`

---

### 6. Frontend SPA

#### 6.1 Authentication Pages

**User Story**: As a user, I want login and signup pages so that I can authenticate in the browser.

**Acceptance Criteria**:

- [ ] 6.1.1 The app SHALL have a `/login` route with email and password fields
- [ ] 6.1.2 The app SHALL have a `/signup` route with name, email, and password fields
- [ ] 6.1.3 On successful auth, the JWT SHALL be stored (localStorage or memory) and the user redirected to `/projects`
- [ ] 6.1.4 Unauthenticated users accessing protected routes SHALL be redirected to `/login`
- [ ] 6.1.5 Validation errors from the API SHALL be displayed inline on the form fields

#### 6.2 Projects Page

**User Story**: As a user, I want to see and manage my projects.

**Acceptance Criteria**:

- [ ] 6.2.1 `/projects` SHALL list all projects the user belongs to, showing name, member count, task count, and the user's role
- [ ] 6.2.2 The page SHALL have a "Create Project" button that opens a form (name, description)
- [ ] 6.2.3 Clicking a project SHALL navigate to `/projects/:id`

#### 6.3 Project Detail Page

**User Story**: As a user, I want to view and manage tasks within a project.

**Acceptance Criteria**:

- [ ] 6.3.1 `/projects/:id` SHALL display the project name, member list, and task list
- [ ] 6.3.2 Tasks SHALL be displayed with title, status badge, priority badge, due date, and assignee
- [ ] 6.3.3 ADMIN users SHALL see buttons to create, edit, and delete tasks
- [ ] 6.3.4 MEMBER users SHALL see a status dropdown only on tasks assigned to them
- [ ] 6.3.5 ADMIN users SHALL see a members panel with the ability to add (by email) and remove members
- [ ] 6.3.6 Task status changes SHALL be reflected immediately in the UI (optimistic update or refetch)

#### 6.4 Dashboard Page

**User Story**: As a user, I want a visual dashboard to understand project progress.

**Acceptance Criteria**:

- [ ] 6.4.1 `/projects/:id/dashboard` SHALL display total task count
- [ ] 6.4.2 The page SHALL display tasks grouped by status (e.g., as cards or a chart)
- [ ] 6.4.3 The page SHALL display a list of tasks per user with counts
- [ ] 6.4.4 The page SHALL display the overdue task count with a visual indicator
- [ ] 6.4.5 The dashboard data SHALL be fetched from `GET /api/dashboard/:projectId`

---

### 7. API and Infrastructure

#### 7.1 RESTful API

**Acceptance Criteria**:

- [ ] 7.1.1 All API endpoints SHALL follow REST conventions (correct HTTP verbs and status codes)
- [ ] 7.1.2 All error responses SHALL use consistent shape: `{ error: string }` or `{ errors: ValidationError[] }`
- [ ] 7.1.3 All successful creation responses SHALL return `201`; updates and reads SHALL return `200`

#### 7.2 Input Validation

**Acceptance Criteria**:

- [ ] 7.2.1 All user inputs SHALL be validated server-side using express-validator before any DB operation
- [ ] 7.2.2 Invalid inputs SHALL return `400` with a structured errors array

**Correctness Properties**:
- For any request with missing required fields: response is always `400` with a non-empty `errors` array

#### 7.3 Railway Deployment

**Acceptance Criteria**:

- [ ] 7.3.1 The backend SHALL be deployable as a Railway service with `npm start` (`node src/index.js`)
- [ ] 7.3.2 The backend SHALL read `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and `PORT` from environment variables
- [ ] 7.3.3 The frontend SHALL be buildable with `npm run build` and servable as static files
- [ ] 7.3.4 The frontend SHALL read the backend URL from `VITE_API_URL` environment variable at build time
- [ ] 7.3.5 The backend SHALL run `prisma migrate deploy` before starting in production (via Railway start command or Procfile)
