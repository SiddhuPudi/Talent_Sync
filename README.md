# 🚀 Talent Sync

![CI/CD Pipeline](https://github.com/SiddhuPudi/Talent_Sync/actions/workflows/devOps.yml/badge.svg)

**A full-stack job searching platform built with modern technologies, featuring real-time communication, job management, and scalable architecture.**

---

## 🌏 Live Demo

**🌐 Frontend:** https://talent-sync-green.vercel.app/

**⚙️ Backend API:** https://talent-sync-pq7j.onrender.com/

---

## 🌟 Features

### 🔐 Authentication
- JWT-based authentication with secure token handling
- Persistent login sessions across page refreshes
- Form validation (email + password rules)
- OTP-based 2 step verification

### 👤 Profile & Connections
 - Dynamic user profiles with real-time stats
 - Send / Accept / Reject connection requests
 - Persistent connection states (no reset on refresh)
 - Navigate to other users’ profiles
 -	Connection-based chat access

### 💼 Jobs System
- Post jobs (verified users only)
- Job search (title, company, location)
- Apply via professional form (resume + message)
- Prevent duplicate applications

### 💬 Real-Time Chat
- Socket.IO-based instant messaging
- Typing indicators with animated dots
- Online / Offline status with green glow
- Mobile-responsive sidebar toggle

### 🔔 Notifications
- Real-time push notifications via Socket.IO
- Mark as read / Mark all as read
- Persistent unread count badge
- Relative timestamps (e.g., "5m ago")
- Connection + job + chat notifications

---

## 🧱 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 3 |
| **Backend** | Node.js, Express 5, Prisma ORM |
| **Database** | PostgreSQL (Neon) |
| **Real-time** | Socket.IO |
| **Containerization** | Docker & Docker Compose |
| **API Docs** | Swagger (swagger-ui-express) |
| **Email Service** | Nodemailer |
| **Deployment** | Render (Backend), Vercel (Frontend) |
| **CI/CD** | GitHub Actions |
| **Logging** | Winston |
| **Caching** | Redis |
| **Event Streaming** | Apache Kafka (KafkaJS) |

---

## 📁 Project Structure

```
Talent_Sync/
│
├── .github/
│   └── workflows/
│       └── devOps.yml       # CI/CD pipeline (GitHub Actions)
│
├── Backend/
│   ├── prisma/              # Database schema & migrations
│   ├── src/
│   │   ├── config/          # Redis, Prisma, Kafka, Swagger config
│   │   ├── controllers/     # Route handlers
│   │   ├── middlewares/      # Auth, rate limiting, error handling
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Kafka producer/consumer
│   │   ├── sockets/         # Socket.IO chat handlers
│   │   ├── utils/           # Helpers & utilities
│   │   └── app.js           # Express app setup
│   ├── server.js            # Entry point (HTTP + Socket.IO + Kafka)
│   ├── README.md
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Toast, ProtectedRoute
│   │   ├── features/        # Auth, Chat, Jobs, Profile services
│   │   ├── hooks/           # useDebounce
│   │   ├── layouts/         # MainLayout
│   │   ├── pages/           # Home, Jobs, Chat, Notifications, Profile, Auth
│   │   ├── services/        # Axios API client
│   │   ├── sockets/         # Socket.IO client
│   │   ├── store/           # AuthContext, NotificationContext
│   │   └── utils/           # Helpers & utilities
│   ├── Dockerfile
│   ├── README.md 
│   └── index.html
│
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** running locally or via Docker

  #### Optional
- **Redis** running locally or via Docker 
- **Kafka** (optional — for event streaming)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/SiddhuPudi/Talent_Sync
cd Talent_Sync
```

---

### 2️⃣ Run with Docker (Recommended)

```bash
docker-compose up --build
```

This starts PostgreSQL, Redis, Kafka, the backend, and serves the frontend.

---

### 3️⃣ Run Manually

**Backend:**
```bash
cd Backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

### 4️⃣ Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| API Docs (Swagger) | http://localhost:3000/api-docs |

---

## 🧪 Environment Variables

### Backend (`Backend/.env.local`)

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/talent_sync
JWT_SECRET=your_jwt_secret

# Optional:
REDIS_URL=redis://localhost:6379
KAFKA_BROKER=localhost:9092
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5173
```

---

## 🛡️ Rate Limiting

The backend implements **route-based rate limiting** with Redis-backed stores:

| Route Type | Limit | Window | Strategy |
|-----------|-------|--------|----------|
| **Auth** (login/register) | 15 requests | 15 min | IP-based, skips successful requests |
| **Read** (GET routes) | 300 requests | 1 min | User + IP based |
| **Write** (POST/PATCH) | 60 requests | 1 min | User + IP based |

The frontend coordinates with exponential backoff retry (2s → 4s → 8s) and 300ms search debouncing.

---

## 🔄 CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and deployment, defined in [`.github/workflows/devOps.yml`](.github/workflows/devOps.yml).

**Triggers:** `push` to `main` / `dev` and `pull_request` to `main`

### Pipeline Architecture

```mermaid
graph LR
  A[🖥️ Frontend] --> C[🧪 Integration]
  B[⚙️ Backend] --> C
  C --> D{Branch?}
  D -->|main| E[🚀 Production]
  D -->|dev| F[🧪 Staging]
```

### Jobs Overview

| Job | Runs On | Description |
|-----|---------|-------------|
| **🖥️ Frontend** | `ubuntu-latest` | Installs deps (cached), lints, builds, creates Docker image & uploads as artifact |
| **⚙️ Backend** | `ubuntu-latest` | Installs deps (cached), creates Docker image & uploads as artifact |
| **🧪 Integration** | `ubuntu-latest` | Downloads pre-built images, runs Docker Compose, verifies all containers are healthy |
| **🚀 Deploy Production** | `ubuntu-latest` | Deploys to Render & Vercel, runs health checks against live URLs *(main branch only)* |
| **🧪 Deploy Staging** | `ubuntu-latest` | Deploys to staging environments *(dev branch only)* |

### Key Features

| Feature | Details |
|---------|---------|
| **Docker Image Artifacts** | Images built once in frontend/backend jobs, saved as artifacts, and reused in integration — no duplicate builds |
| **Dependency Caching** | `actions/cache@v4` caches `~/.npm` keyed by `package-lock.json` hash — faster CI runs |
| **Parallel Jobs** | Frontend & Backend jobs run simultaneously, integration waits for both |
| **Concurrency Control** | Duplicate runs on the same branch are auto-cancelled |
| **Environment-Based Deploy** | `main` → Production, `dev` → Staging |
| **Health Checks** | `curl -f` validates both live Backend & Frontend URLs post-deploy |
| **Graceful Teardown** | Docker Compose is torn down even if prior steps fail (`if: always()`) |

### Required GitHub Secrets

| Secret | Environment | Purpose |
|--------|-------------|---------|
| `DATABASE_URL` | Backend | PostgreSQL connection string for Docker Compose |
| `JWT_SECRET` | Backend | JWT signing secret for the backend |
| `RENDER_DEPLOY_HOOK` | - | Render deploy webhook URL (Backend) |
| `VERCEL_DEPLOY_HOOK` | - | Vercel deploy webhook URL (Frontend) |
| `RENDER_STAGING_DEPLOY_HOOK` | Staging | Render staging deploy webhook URL |
| `VERCEL_STAGING_DEPLOY_HOOK` | Staging | Vercel staging deploy webhook URL |

---

## 🧠 Key Highlights

- **Real-time chat system using Socket.IO**
- **Backend-driven UI (no fake data)**
- **Production-grade authentication handling**
- **Persistent state across refresh**
- **Clean and responsive UI design**
- **Modular and scalable architecture**
- **Automated CI/CD pipeline with GitHub Actions**

---

## 📌 Future Improvements

- [ ] Pagination & infinite scroll for jobs and notifications
- [ ] File uploads via S3 / Cloudinary for profile avatars
- [ ] Advanced search filters (salary range, job type, experience)
- [ ] Password reset flow
- [ ] Mobile app (React Native)

---

## 👨‍💻 Authors

- **P. Thrivikram**
- **M. Leela Yaswanth**
- **S. Abdul Sami**
- **U. Karthikeya**

---