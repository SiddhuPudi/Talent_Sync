import React from "react";
import ReactDOM from "react-dom/client";
import App from './App.jsx'
import "./index.css";
import { AuthProvider } from "./store/AuthContext";
import { NotificationProvider } from "./store/NotificationContext";
import Auth from "./pages/Auth.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);
