import { createContext, useContext, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

function lireUserStocke() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(lireUserStocke);

  const saveUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  };

  const login = async (email, password) => {
    const { data } = await api.post("/login", { email, password });
    localStorage.setItem("token", data.token);
    saveUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch {
    }
    localStorage.removeItem("token");
    saveUser(null);
  };

  const clearSession = () => {
    localStorage.removeItem("token");
    saveUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout, saveUser, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
