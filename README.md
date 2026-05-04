# Ethara AI 🚀

Enterprise-grade project and task management system built for high-performance teams. Ethara AI brings clarity, structure, and real-time collaboration to your workflows.

## ✨ Core Features

*   **Secure Authentication:** Full JWT-based login and signup system with encrypted passwords.
*   **Role-Based Access Control (RBAC):** Distinct `ADMIN` and `MEMBER` roles. Admins have full control over project configuration, task creation, and team management.
*   **Kanban Board Ecosystem:** Intuitive drag-and-drop styled Kanban boards to track tasks across `To Do`, `In Progress`, and `Completed` statuses.
*   **Enterprise Dashboard:** A high-level hub that calculates operational efficiency, surfaces overdue tasks, and organizes active workstreams.
*   **Team Management:** Easily invite members to workspaces via email and manage their operational bandwidth.

## 🛠️ Technology Stack

*   **Frontend:** React (Vite), React Router, Vanilla CSS (Custom Design System)
*   **Backend:** Node.js, Express.js
*   **Database:** PostgreSQL (Hosted on Supabase)
*   **ORM:** Prisma
*   **Security:** JWT, bcryptjs, express-validator

## 🚀 Running Locally

You will need two terminal windows to run both the frontend and backend servers simultaneously.

### 1. Database Setup
Ensure you have created a Supabase PostgreSQL database. 

Create a `.env` file inside the `/server` directory and add the following template (do not commit your real `.env` file to GitHub!):

```env
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="your_super_secret_jwt_key_here"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
PORT=5000
```

### 2. Start the Backend Server
Open your first terminal and navigate to the server folder:
```bash
cd server
npm install
npx prisma migrate dev --name init
npm run dev
```

### 3. Start the Frontend Client
Open a second terminal window and navigate to the client folder:
```bash
cd client
npm install
npm run dev
```

Your application will now be running at `http://localhost:5173`.

## 🌐 Deployment

This repository is structured for a seamless monorepo deployment on **Railway**.

1. Connect your GitHub repository to Railway.
2. **Deploy Backend:** Create a new service, set the Root Directory to `/server`, and add your `DATABASE_URL` and `JWT_SECRET` variables.
3. **Deploy Frontend:** Create a second service from the same repo, set the Root Directory to `/client`, and add `VITE_API_URL` pointing to your backend's public domain.
4. Railway will automatically handle the build steps and database migrations!
