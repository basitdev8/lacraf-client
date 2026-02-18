"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { adminApi } from "@/lib/admin-api";
import type { AdminUser } from "@/lib/admin-types";

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminAccessToken");
    if (token) {
      const stored = localStorage.getItem("adminUser");
      if (stored) {
        try {
          setAdmin(JSON.parse(stored));
        } catch {
          // corrupted, ignore
        }
      }
    }
    setLoading(false);
  }, []);

  // When the admin API client detects both tokens are expired,
  // clean up state and redirect to the admin login page.
  useEffect(() => {
    function handleSessionExpired() {
      adminApi.clearTokens();
      setAdmin(null);
      window.location.href = "/admin/login";
    }
    window.addEventListener("admin:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("admin:session-expired", handleSessionExpired);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<AdminUser> => {
    const data = await adminApi.post<{
      admin: AdminUser;
      accessToken: string;
      refreshToken: string;
    }>("/admin/login", { email, password });
    adminApi.setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem("adminUser", JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data.admin;
  };

  const logout = () => {
    adminApi.clearTokens();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
