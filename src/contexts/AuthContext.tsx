import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
// Auth context for MiConsultorio
import type { User } from "@/services/api/types";
import { authApi } from "@/services/api/client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "mc_auth_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    try {
      const res = await authApi.login(email, _password);
      if (res.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, error: "Credenciales inválidas" };
    } catch {
      return { success: false, error: "Error al iniciar sesión" };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
