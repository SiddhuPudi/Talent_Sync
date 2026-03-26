# 🎨 Talent Sync Frontend

Frontend for **Talent Sync** — a platform built using React and Tailwind CSS with a premium dark-themed UI.

---

## 🚀 Features

- Responsive dark theme UI with glassmorphism effects
- Real-time chat with typing indicators & online status
- Job listings with search, filters & one-click apply
- Live notifications with relative timestamps
- User profiles with connection management
- Debounced search with AbortController
- Persistent auth across page refreshes
- Smooth micro-animations & skeleton loading states

---

## 🧱 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Axios** | HTTP client with retry interceptor |
| **Socket.IO Client** | Real-time messaging & notifications |

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
├── components/      # Navbar, Toast, ProtectedRoute, PublicRoute
├── features/
│   ├── auth/        # Login & register services
│   ├── chat/        # (reserved)
│   ├── connection/  # Connection request services
│   ├── jobs/        # Job CRUD services
│   └── profile/     # Profile & connections services
├── hooks/           # useDebounce
├── layouts/         # MainLayout with footer
├── pages/           # Home, Jobs, Chat, Auth, Notifications, Profile
├── services/        # Axios API client, application service
├── sockets/         # Socket.IO client instance
├── store/           # AuthContext, NotificationContext
└── utils/           # Helpers & utilities
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

## 📌 Notes

- Uses **JWT authentication** stored in localStorage with synchronous restoration
- Integrates with backend REST APIs via Axios interceptors
- **Rate limit coordination** — exponential backoff retry (2s → 4s → 8s) on 429 responses
- Uses **Socket.IO** for real-time chat, typing indicators, and notification delivery
- Search inputs are **debounced** (300ms) to prevent API spam