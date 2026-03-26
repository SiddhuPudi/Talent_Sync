# 🚀 Talent Sync

**A full-stack job searching platform built with modern technologies, featuring real-time communication, job management, and scalable architecture.**

---

## 🌟 Features

### 🔐 Authentication
- JWT-based authentication with secure token handling
- Protected & public route guards
- Persistent login sessions across page refreshes

### 👤 Profile & Connections
- User profiles with editable info
- Send / Accept / Reject connection requests
- Real-time connection status updates
- Profile stats derived from live data

### 💼 Jobs System
- Post jobs (verified users only)
- Apply to jobs with real-time feedback
- Prevent duplicate applications
- Search & filter by title, company, and location

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

---

## 🧱 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 3 |
| **Backend** | Node.js, Express 5, Prisma ORM |
| **Database** | PostgreSQL |
| **Real-time** | Socket.IO with Redis Adapter |
| **Caching** | Redis |
| **Event Streaming** | Apache Kafka (KafkaJS) |
| **Containerization** | Docker & Docker Compose |
| **API Docs** | Swagger (swagger-ui-express) |
| **Logging** | Winston |

---

## 📁 Project Structure

```
Talent_Sync/
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
- **Redis** running locally or via Docker
- **Kafka** (optional — for event streaming)

---

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
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

## 🧠 Key Highlights

- **Real-time architecture** — Socket.IO with Redis pub/sub adapter for horizontal scaling
- **Event-driven processing** — Kafka for decoupled notification and activity streaming
- **Production-grade auth** — Synchronous token restoration prevents route flicker on refresh
- **Smart rate limiting** — Per-route Redis stores with user+IP keying; no false 429 errors
- **Modern dark UI** — Custom Tailwind design system with glassmorphism, micro-animations, and shimmer skeletons
- **Mobile-first responsive** — All pages work on mobile, tablet, and desktop

---

## 📌 Future Improvements

- [ ] Pagination & infinite scroll for jobs and notifications
- [ ] File uploads via S3 / Cloudinary for profile avatars
- [ ] Advanced search filters (salary range, job type, experience)
- [ ] Email verification & password reset flow
- [ ] Mobile app (React Native)
- [ ] CI/CD pipeline with GitHub Actions

---

## 👨‍💻 Authors

- **P. Thrivikram**
- **M. Leela Yaswanth**
- **S. Abdul Sami**
- **U. Karthikeya**

---

<div align="center">
  <sub>Built with ❤️ using React, Node.js, and modern web technologies</sub>
</div>
