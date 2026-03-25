import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      try {
        const decodedUser = JSON.parse(atob(storedToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        setUser(decodedUser);
      } catch(e) { console.error("Invalid token decoding in AuthContext"); }
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    try {
        const decodedUser = JSON.parse(atob(newToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        setUser(decodedUser);
    } catch(e) { console.error("Invalid token parsing during login"); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);