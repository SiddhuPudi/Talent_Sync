# 🚀 Talent Sync — Backend

A production-ready backend system for a professional networking and job platform, designed with scalable architecture, real-time communication, and clean modular structure.

---

## 📌 Overview

Talent Sync backend powers:
- 🔐 Authentication & Authorization (JWT + OTP)
- 👤 User Profiles
- 🤝 Connection System (like LinkedIn)
- 💼 Job Posting & Applications
- 💬 Real-time Chat (Socket.IO)
- 🔔 Notification System (DB + real-time)
- 🐳 Containerized Infrastructure (Docker)
- ✉️ Email Notifications (Nodemailer)
- ⚡ Caching & Scaling (Redis)

---

## 🌍 Live API

 - **⚙️ Base URL:** https://talent-sync-pq7j.onrender.com
 - **📄 Swagger Docs:** https://talent-sync-pq7j.onrender.com/api-docs

---

## 🏗️ Architecture

```bash
Client
  ↓
Backend (Node.js + Express)
  ↓
PostgreSQL (Database)
```

### 🔄 Optional (Scalable Setup)

```bash
Backend
  ↓
Redis (Caching + Socket scaling)
  ↓
Kafka (Event-driven processing)
```
> ⚠️ Redis & Kafka are implemented but optional in deployment for simplicity and cost efficiency.

---

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express |
| Database | PostgreSQL (Neon), Prisma ORM |
| Real-time | Socket.IO |
| Email | Nodemailer(Gmail SMTP) |
| Cache | Redis |
| Messaging Queue | Apache Kafka |
| Containerization | Docker, Docker Compose |
| API Docs | Swagger |

---

## 📁 Project Structure

```bash
backend/
│
├── src/
│   ├── config/          # DB, Redis, Kafka, Swagger configs
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middlewares/     # Auth, error handling
│   ├── sockets/         # Real-time logic
│   ├── utils/           # Helpers
│   └── app.js
│
├── prisma/              # Database schema
├── uploads/             # File uploads
├── logs/                # Logging files
│
├── Dockerfile
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```bash
PORT=3000
JWT_SECRET=your_secret
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/talent_sync

# Email (for OTP + notifications):
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Optional:
REDIS_URL=redis://redis:6379
KAFKA_BROKER=kafka:9093
```

---

## 🚀 Running the Project

🐳 Using Docker (Recommended)

```bash
docker-compose up --build
```

---

## 🧪 Local Development

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

---

## 📡 API Documentation

Swagger UI available at:

```bash
http://localhost:3000/api-docs
```

---

## 🔐 Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Input validation (email + password rules)
- OTP-based verification (email)
- Protected routes via middleware
- Role-based authorization (extendable)

## 🔑 OTP Flow
- User logs in / registers
- OTP sent via email
- User verifies OTP
- Access granted

---

## 💬 Real-Time Chat
- Built using Socket.IO
- Features:
  - Live messaging
  - Typing indicators
  - Online/offline status
- Scaled using Redis adapter

---

## 🔔 Notification System
- Stored in database
- Supports:
  - Messages
  - Connection requests
  - Job updates
  - Application status
- Stored in database + real-time push via sockets

---

## 📧 Email System
- Built using Nodemailer
- Reusable email utility
- Triggers:
  - Connection request
  - Connection accepted
  - Job posted
  - OTP verification


---

## ⚡ Caching (Redis)
- Job listings caching
- Online user tracking
- Improved performance under load

---

## 🧠 Scalability Features
- Modular service-based architecture
- Horizontal scaling ready
- Redis for shared state
- Kafka for async processing
- Dockerized microservice-friendly setup

---

## 🗄️ Database
- PostgreSQL (Neon cloud DB)
- Optimized queries
- Prisma ORM

---

## 🧪 Core API Modules
- Auth
- Users / Profiles
- Jobs
- Applications
- Connections
- Chat
- Notifications

---

## 🛡️ Security
- JWT authentication
- Password hashing (bcrypt)
- Input validation
- Rate limiting
- Protected routes

---

## 🐳 Docker Setup Includes
- Backend service
- PostgreSQL
- Redis
- Kafka + Zookeeper

---

## 📈 Future Improvements
- Kubernetes deployment
- CI/CD pipelines
- Password reset flow
- File storage (S3/Cloudinary)

---

## 👨‍💻 Author

Built as a full-stack scalable system to demonstrate:
- Backend engineering
- System design
- Real-time systems
- Distributed architecture

---

## ⭐ Why This Project Stands Out
- Real-time communication (chat + notifications)
- OTP-based authentication
- Email integration (Nodemailer)
- Clean architecture
- Deployment-ready backend
- Scalable design with optional Redis/Kafka
- Production-ready setup

---

## 📄 License

This project is for educational and portfolio purposes.