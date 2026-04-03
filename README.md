# 🚀 Talent Sync

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
| **Deployment** | Render(Backend), Vercel(Frontend) |
| **Logging** | Winston |
| **Caching** | Redis |
| **Event Streaming** | Apache Kafka (KafkaJS) |

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

## 🧠 Key Highlights

- **Real-time chat system using Socket.IO**
- **Backend-driven UI (no fake data)**
- **Production-grade authentication handling**
- **Persistent state across refresh**
- **Clean and responsive UI design**
- **Modular and scalable architecture**

---

## 📌 Future Improvements

- [ ] Pagination & infinite scroll for jobs and notifications
- [ ] File uploads via S3 / Cloudinary for profile avatars
- [ ] Advanced search filters (salary range, job type, experience)
- [ ] Password reset flow
- [ ] Mobile app (React Native)
- [ ] CI/CD pipeline with GitHub Actions

---

## 👨‍💻 Authors

- **P. Thrivikram**
- **M. Leela Yaswanth**
- **S. Abdul Sami**
- **U. Karthikeya**

---