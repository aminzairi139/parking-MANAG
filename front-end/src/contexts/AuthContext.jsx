import React, { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";
import { getValidToken } from "../utils/token";
import { migrateLegacyStorage } from "../utils/indexedDB";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      await migrateLegacyStorage();
      const token = getValidToken();
      setUser(token ? authService.getCurrentUser() : null);
      setLoading(false);
    };

    const handleLogout = () => setUser(null);
    restoreSession();
    window.addEventListener("auth:logout", handleLogout);

    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const login = async (email, password, rememberMe) => {
    const result = await authService.login(email, password, rememberMe);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return context;
}
