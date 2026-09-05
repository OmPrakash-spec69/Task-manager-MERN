# Task-manager-MERN
# Task Manager — MERN Stack

A full-featured, production-ready task management web application built with
**MongoDB, Express.js, React.js, and Node.js**. Features secure JWT
authentication, per-user data isolation, complete CRUD for tasks, and a
minimalist black & white UI with filtering, searching, sorting, and a live
statistics dashboard.

```
task-manager-mern/
├── backend/     Express REST API (JWT auth, MongoDB/Mongoose)
└── frontend/    React SPA (Vite, minimalist black & white UI)
```

---

## Features

**Authentication & Authorization**
- Register / Login / Logout with JWT
- Passwords hashed with bcrypt (never stored or returned in plain text)
- Protected routes via JWT middleware (`Authorization: Bearer <token>`)
- Strict ownership checks — a user can only read/update/delete their own tasks

**Task Management**
- Create, read, update, delete tasks
- Fields: title (required), description, priority (Low/Medium/High), due date, completion status
- Toggle completion with one click
- Bulk-delete all completed tasks

**Productivity Tools**
- Filter: All / Pending / Completed
- Search by title or description (debounced)
- Sort: Newest, Oldest, Priority, Due Date
- Live stats dashboard: Total, Completed, Pending, Overdue

**Engineering**
- Centralized error handling & validation middleware (express-validator)
- Clean, layered backend architecture (routes → controllers → models)
- Environment variables for all secrets/config
- Toast notifications, loading skeletons, and inline form validation on the frontend

---

## Tech Stack

| Layer      | Technology                                   |
|------------|-----------------------------------------------|
| Database   | MongoDB + Mongoose                            |
| Backend    | Node.js, Express.js, JWT, bcryptjs            |
| Frontend   | React 18, Vite, React Router, Axios           |
| UX         | react-hot-toast, react-icons                  |

---

## 1. Prerequisites

- Node.js v18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string

---

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/task_manager
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Run the server:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The API will be live at `http://localhost:5000/api`. Health check:
`GET http://localhost:5000/api/health`.

---

## 3. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` if your API runs somewhere other than the default:

```
VITE_API_URL=http://localhost:5000/api
```

Run the dev server:

```bash
npm run dev
```

Visit `http://localhost:5173`.

---

## 4. API Reference

All task routes require the header: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint             | Description                  | Access  |
|--------|-----------------------|-------------------------------|---------|
| POST   | `/api/auth/register`  | Register a new user           | Public  |
| POST   | `/api/auth/login`     | Login and receive a JWT       | Public  |
| GET    | `/api/auth/me`        | Get current user profile      | Private |
| POST   | `/api/auth/logout`    | Logout (client discards token)| Private |

### Tasks
| Method | Endpoint                    | Description                                   | Access  |
|--------|------------------------------|------------------------------------------------|---------|
| GET    | `/api/tasks`                 | List tasks (`?status=&search=&sortBy=`)         | Private |
| GET    | `/api/tasks/stats`           | Get total/completed/pending/overdue counts      | Private |
| GET    | `/api/tasks/:id`             | Get a single task                               | Private |
| POST   | `/api/tasks`                 | Create a task                                   | Private |
| PUT    | `/api/tasks/:id`              | Update a task                                   | Private |
| PATCH  | `/api/tasks/:id/toggle`       | Toggle completion status                        | Private |
| DELETE | `/api/tasks/:id`              | Delete a task                                   | Private |
| DELETE | `/api/tasks/completed/all`    | Delete all completed tasks for the user         | Private |

Query params for `GET /api/tasks`:
- `status`: `all` | `pending` | `completed`
- `search`: matches title or description (case-insensitive)
- `sortBy`: `newest` | `oldest` | `priority` | `dueDate`

### Example: Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123"}'
```

### Example: Create a task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Finish report","priority":"High","dueDate":"2026-09-10"}'
```

---

## 5. Security Notes

- Passwords are hashed with bcrypt (10 salt rounds) before saving; the hash is
  never returned in API responses (`select: false` + custom `toJSON`).
- JWTs are signed with a server-side secret and expire (`JWT_EXPIRES_IN`).
- Every task route verifies the requester owns the resource before allowing
  read/update/delete — attempting to access another user's task returns `403`.
- All user input is validated server-side with `express-validator`, in
  addition to client-side validation for immediate feedback.
- CORS is restricted to `CLIENT_URL`.

---

## 6. Folder Structure

```
backend/
├── config/db.js              MongoDB connection
├── controllers/               Route handlers (business logic)
│   ├── authController.js
│   └── taskController.js
├── middleware/
│   ├── auth.js                 JWT verification
│   ├── validate.js             express-validator result handler
│   └── errorHandler.js         Central error handler + 404
├── models/
│   ├── User.js
│   └── Task.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── utils/
│   ├── generateToken.js
│   ├── ApiError.js
│   └── asyncHandler.js
├── app.js
└── server.js

frontend/
├── src/
│   ├── api/                    axios instance + endpoint wrappers
│   ├── components/              Navbar, TaskCard, TaskModal, StatsPanel, etc.
│   ├── context/AuthContext.jsx  Global auth state
│   ├── pages/                   Login, Register, Dashboard
│   ├── utils/                   validators, date helpers
│   ├── styles/index.css         Black & white design system
│   ├── App.jsx
│   └── main.jsx
└── index.html
```
