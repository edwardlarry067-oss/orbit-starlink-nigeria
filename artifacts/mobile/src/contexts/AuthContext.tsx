import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest, getToken, setToken, removeToken } from "../lib/api";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      if (stored) {
        setTokenState(stored);
        try {
          const me = await apiRequest<User>("GET", "auth/me");
          setUser(me);
        } catch {
          await removeToken();
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<{ token: string; user: User }>("POST", "auth/login", { email, password });
    await setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await apiRequest<{ token: string; user: User }>("POST", "auth/register", { name, email, password });
    await setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    await removeToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
