# 🎨 Talent Sync Frontend

Frontend for **Talent Sync** — a platform built using React, Vite, and Tailwind CSS with a modern, responsive dark-themed UI.

---

## 🚀 Features

### 🎯 Core Functionality
 - Job listings with search, filters, and salary display
 - Job Details Modal (LinkedIn-style full view)
 - Apply via professional form (resume + message)
 - Prevent duplicate job applications

### 💬 Real-Time Features
 - Instant chat with Socket.IO
 - Typing indicators
 - Online/offline user status
 - Real-time notifications

 ### 🔔 Notifications System
 - Live notifications with relative timestamps (e.g., “5m ago”)
 - Mark as read / mark all as read
 - Persistent unread badge (backend-driven)

### 👤 Profile & Connections
 - Dynamic profile with real-time stats
 - View other user profiles
 - Send / Accept / Reject connection requests
 - Connection-based chat access

### 🔐 Authentication UX
 - JWT-based login & register
 - Persistent sessions across refresh
 - Form validation (email + password rules)
 - OTP verification flow

### 📱 UI/UX Enhancements
 - Fully mobile-responsive design
 - Sticky navbar with blur effect
 - Smooth scrolling (no layout breaking)
 - Responsive dark theme UI with glassmorphism effects

---

## 🧱 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Axios** | API communication with interceptors |
| **Socket.IO Client** | Real-time chat & notifications |

---

## ⚙️ Setup

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

App runs at **http://localhost:5173**

### Build for production

```bash
npm run build
```

### Run with Docker

```bash
docker build -t talent-sync-frontend .
docker run -p 5173:5173 talent-sync-frontend
```

---

## 🔗 API Configuration

Set backend URL in `.env`:

```env
VITE_API_URL=http://localhost:3000
```

---

## 📁 Structure

```
src/
├── components/        # Navbar, Toast, ProtectedRoute, PublicRoute
├── features/
│   ├── auth/          # Login & register services
│   ├── connection/    # Connection APIs
│   ├── jobs/          # Job CRUD services
│   ├── notifications/ # Notification services
│   └── profile/       # Profile & connections
├── hooks/             # useDebounce
├── layouts/           # MainLayout with footer
├── pages/             # Home, Jobs, Chat, Auth, Notifications, Profile
├── services/          # Axios API client, application service
├── sockets/           # Socket.IO client instance
├── store/             # AuthContext, NotificationContext
└── utils/             # Helpers & utilities
```

---

## 🎯 Key UI Features

- **Dark theme** with custom Tailwind color palette
- **Glassmorphism** navbar with backdrop blur
- **Shimmer skeletons** for all loading states
- **Toast notifications** for non-blocking feedback
- **Smooth animations** — fade-in, slide-up, scale-in, bounce
- **Mobile-first** responsive design across all pages
- **Profile dropdown** & hamburger menu on mobile

---

## ⚡ Performance Optimizations

 - Debounced API calls (search inputs)
 - Request cancellation using AbortController
 - Exponential backoff retry on 429 errors (2s → 4s → 8s)
 - Minimal re-renders using optimized state handling

---

## 📌 Notes

- Uses **JWT authentication** stored in localStorage with synchronous restoration
- Integrates with backend REST APIs via Axios interceptors
- Uses **Socket.IO** for real-time updates
- Search inputs are **debounced** (300ms) to prevent API spam
- Backend-driven UI (no fake data)