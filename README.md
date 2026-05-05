# 🚀 Ethara AI — Team Task Manager

A full-stack, enterprise-grade project and task management platform built for high-performance teams. Ethara AI enables seamless collaboration with role-based access control, real-time Kanban boards, and a powerful analytics dashboard.

> **🌐 Live URL:** [https://teamtaskmanager-production-2e3c.up.railway.app](https://teamtaskmanager-production-2e3c.up.railway.app)
>
> **📦 GitHub Repo:** [https://github.com/Ranjeet250/Team_Task_manager](https://github.com/Ranjeet250/Team_Task_manager)

---

## ✨ Key Features

### 🔐 Authentication (Signup / Login)
- Secure JWT-based authentication system
- Passwords encrypted with **bcryptjs** (salt factor 12)
- Protected routes on both frontend and backend
- Persistent login sessions via token storage

### 📁 Project & Team Management
- Create, update, and delete projects
- Invite team members by email
- Assign roles: **Admin** or **Member**
- View project progress with completion percentages

### ✅ Task Creation, Assignment & Status Tracking
- Full **Kanban Board** with three columns: `To Do`, `In Progress`, `Completed`
- Create tasks with title, description, priority (Low / Medium / High), and due dates
- Assign tasks to specific team members
- Update task status and track progress visually

### 📊 Dashboard (Tasks, Status, Overdue)
- **Project Health Hub** — enterprise-level analytics dashboard
- Total tasks, in-progress count, and completion efficiency percentage
- Dedicated **Overdue Tasks** panel with visual warnings
- **My Assigned Tasks** panel for personalized task tracking

### 🛡️ Role-Based Access Control (RBAC)
- Two roles: **ADMIN** and **MEMBER**
- **Admins** can: create/delete projects, add/remove members, change roles, manage all tasks
- **Members** can: view projects, update assigned tasks
- Backend middleware (`authorize`) enforces role checks on every protected API route
- Frontend dynamically hides/shows UI elements based on user role

---

## 🛠️ Technology Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| **Frontend** | React 19, Vite, React Router v7    |
| **Styling**  | Vanilla CSS (Custom Design System) |
| **Backend**  | Node.js, Express.js                |
| **Database** | PostgreSQL (Supabase)              |
| **ORM**      | Prisma                             |
| **Auth**     | JWT, bcryptjs                      |
| **Validation** | express-validator                |

---

## 📐 Project Architecture

```
Ethara-AI/
├── client/                    # React Frontend (Vite)
│   ├── src/
│   │   ├── api/               # Axios API configuration
│   │   ├── components/        # Reusable UI components (Header, Sidebar, Layout)
│   │   ├── context/           # AuthContext for global state management
│   │   ├── pages/             # All page components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── ProjectDetailPage.jsx  # Kanban Board + Team Management
│   │   │   ├── TasksPage.jsx
│   │   │   ├── TeamPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── SignupPage.jsx
│   │   ├── routes/            # Protected route wrapper
│   │   ├── index.css          # Complete design system
│   │   └── main.jsx           # App entry point
│   └── package.json
│
├── server/                    # Node.js Backend (Express)
│   ├── src/
│   │   ├── config/            # Prisma database client
│   │   ├── controllers/       # Business logic (auth, projects, tasks, dashboard)
│   │   ├── middleware/        # Auth (JWT verify), Authorize (RBAC), Error Handler
│   │   ├── routes/            # RESTful API route definitions
│   │   ├── utils/             # Token generation utility
│   │   └── server.js          # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma      # Database schema with relationships
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ REST API Endpoints

### Auth
| Method | Endpoint             | Description       | Access  |
|--------|----------------------|-------------------|---------|
| POST   | `/api/auth/register` | Register new user | Public  |
| POST   | `/api/auth/login`    | Login user        | Public  |
| GET    | `/api/auth/me`       | Get current user  | Private |

### Projects
| Method | Endpoint                          | Description          | Access |
|--------|-----------------------------------|----------------------|--------|
| GET    | `/api/projects`                   | Get all projects     | Private |
| POST   | `/api/projects`                   | Create project       | Private |
| GET    | `/api/projects/:id`               | Get project details  | Member+ |
| PUT    | `/api/projects/:id`               | Update project       | Admin   |
| DELETE | `/api/projects/:id`               | Delete project       | Admin   |

### Members
| Method | Endpoint                                | Description       | Access |
|--------|-----------------------------------------|-------------------|--------|
| POST   | `/api/projects/:id/members`             | Add member         | Admin  |
| DELETE | `/api/projects/:id/members/:userId`     | Remove member      | Admin  |
| PATCH  | `/api/projects/:id/members/:userId`     | Change member role | Admin  |

### Tasks
| Method | Endpoint                                     | Description     | Access  |
|--------|----------------------------------------------|-----------------|---------|
| GET    | `/api/projects/:projectId/tasks`             | Get all tasks   | Member+ |
| POST   | `/api/projects/:projectId/tasks`             | Create task     | Member+ |
| PUT    | `/api/projects/:projectId/tasks/:taskId`     | Update task     | Member+ |
| DELETE | `/api/projects/:projectId/tasks/:taskId`     | Delete task     | Admin   |

### Dashboard
| Method | Endpoint         | Description              | Access  |
|--------|------------------|--------------------------|---------|
| GET    | `/api/dashboard` | Get dashboard analytics  | Private |

---

## 🗄️ Database Schema (Prisma)

- **User** — id, name, email, password, createdAt
- **Project** — id, name, description, ownerId, createdAt, updatedAt
- **ProjectMember** — userId, projectId, role (ADMIN/MEMBER), joinedAt
- **Task** — id, title, description, status, priority, dueDate, projectId, assignedToId, createdAt, updatedAt

### Relationships
- User ↔ Project: One-to-Many (owner)
- User ↔ Project: Many-to-Many (via ProjectMember with roles)
- Project ↔ Task: One-to-Many
- User ↔ Task: One-to-Many (assignee)

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)

### 1. Clone the Repository
```bash
git clone https://github.com/Ranjeet250/Team_Task_manager.git
cd Team_Task_manager
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret_key"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
PORT=5000
```

Push the schema to your database:
```bash
npx prisma db push
npm run dev
```

### 3. Setup Frontend
Open a **second terminal**:
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🌐 Deployment (Railway)

This application is deployed as two separate services on **Railway**:

| Service  | Root Directory | Live Domain |
|----------|---------------|-------------|
| Backend  | `/server`     | `teamtaskmanager-production-f2e0.up.railway.app` |
| Frontend | `/client`     | `teamtaskmanager-production-2e3c.up.railway.app` |

### Environment Variables on Railway

**Backend Service:**
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret key for JWT tokens
- `CLIENT_URL` — Frontend domain URL
- `NODE_ENV` — `production`

**Frontend Service:**
- `VITE_API_URL` — Backend API URL (e.g., `https://backend-domain.up.railway.app/api`)

---

## 🔒 Security Measures

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT tokens for stateless authentication
- Input validation & sanitization via **express-validator**
- CORS configured to accept only authorized origins
- Role-based middleware prevents unauthorized API access
- Row Level Security (RLS) enabled on Supabase tables

---

## 👨‍💻 Author

**Ranjeet** — [GitHub](https://github.com/Ranjeet250)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
