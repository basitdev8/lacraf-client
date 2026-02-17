"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { Artisan } from "@/lib/types";

interface AuthContextType {
  artisan: Artisan | null;
  loading: boolean;
  setArtisan: (artisan: Artisan | null) => void;
  login: (email: string, password: string) => Promise<Artisan>;
  logout: () => void;
  refreshUser: () => Promise<Artisan | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<Artisan | null> => {
    try {
      const data = await api.get<{ artisan: Artisan }>("/auth/me");
      setArtisan(data.artisan);
      return data.artisan;
    } catch {
      setArtisan(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<Artisan> => {
    const data = await api.post<{
      artisan: Artisan;
      accessToken: string;
      refreshToken: string;
    }>("/auth/login", { email, password });
    api.setTokens(data.accessToken, data.refreshToken);
    setArtisan(data.artisan);
    return data.artisan;
  };

  const logout = () => {
    api.clearTokens();
    setArtisan(null);
  };

  return (
    <AuthContext.Provider
      value={{ artisan, loading, setArtisan, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
