import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route 
            path="/auth"
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Home />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route e
            path="/jobs" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Jobs />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Chat />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route
            path="/notifications" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Notifications />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
    </BrowserRouter>
  );
}

export default App;