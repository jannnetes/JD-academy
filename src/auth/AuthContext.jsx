import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, getToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMe() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await api("/auth/me");
        setUser(user);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    loadMe();
  }, []);

  async function login(email, password) {
    const { token, user } = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setToken(token);
    setUser(user);
    return user;
  }

  async function register(payload) {
    const data = await api("/auth/register", { method: "POST", body: payload });
    // Email-confirmation flow returns { message } and no token — no auto-login.
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
