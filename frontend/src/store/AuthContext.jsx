import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Synchronously read the token from localStorage on module load
// so that the initial render already has the correct auth state.
function getInitialToken() {
  return localStorage.getItem("token") || null;
}

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch (e) {
    console.error("Invalid token decoding");
    return null;
  }
}

function getInitialUser() {
  const token = getInitialToken();
  if (!token) return null;
  return decodeToken(token);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getInitialToken);
  const [user, setUser] = useState(getInitialUser);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Token and user are already restored synchronously above.
    // This effect just marks loading as complete after the first render.
    setIsAuthLoading(false);
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(decodeToken(newToken));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);