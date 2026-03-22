import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Auth from "./pages/Auth";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;