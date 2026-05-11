import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
// Auth context for MiConsultorio
import type { User } from "@/services/api/types";
import { authApi } from "@/services/api/client";

export type SessionStatus = "authenticated" | "expired" | "blocked" | "idle";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sessionStatus: SessionStatus;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  assertRole: (expectedRole: User["role"], authUser?: User | null) => boolean;
  refreshSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");

  const refreshSession = useCallback(async () => {
    try {
      const res = await authApi.refresh();
      if (res.success && res.data.user) {
        setUser(res.data.user);
        setSessionStatus("authenticated");
      }
    } catch (error) {
      setSessionStatus("expired");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authApi.getCurrentUser();
        if (res.success && res.data) {
          setUser(res.data);
          setSessionStatus(res.data.status === "bloqueado" ? "blocked" : "authenticated");
        }
      } catch {
        setSessionStatus("expired");
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // Silent refresh every 10 minutes
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      const interval = setInterval(() => {
        refreshSession();
      }, 10 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [sessionStatus, refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data.user) {
        setUser(res.data.user);
        setSessionStatus(res.data.user.status === "bloqueado" ? "blocked" : "authenticated");
        return { success: true, user: res.data.user };
      }
      return { success: false, error: "Credenciales inválidas" };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Error al iniciar sesión" };
    }
  }, []);

  const assertRole = useCallback((expectedRole: User["role"], authUser?: User | null) => {
    const current = authUser ?? user;
    return Boolean(current && current.role === expectedRole);
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setSessionStatus("idle");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, sessionStatus, login, logout, assertRole, refreshSession, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
