"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { customerApi } from "@/lib/customer-api";
import type { Customer } from "@/lib/customer-types";

interface CustomerAuthContextType {
  customer: Customer | null;
  loading: boolean;
  setCustomer: (customer: Customer | null) => void;
  login: (email: string, password: string) => Promise<Customer>;
  logout: () => void;
  refreshUser: () => Promise<Customer | null>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(
  undefined
);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<Customer | null> => {
    try {
      const data = await customerApi.get<{ customer: Customer }>(
        "/customer/auth/me"
      );
      setCustomer(data.customer);
      return data.customer;
    } catch {
      setCustomer(null);
      return null;
    }
  }, []);

  // Initial auth check on mount
  useEffect(() => {
    const token = localStorage.getItem("customerAccessToken");
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  // When the API client detects both access + refresh tokens are expired,
  // it fires this event so we clean up state and redirect to /account/login.
  useEffect(() => {
    function handleSessionExpired() {
      customerApi.clearTokens();
      setCustomer(null);
      window.location.href = "/account/login";
    }
    window.addEventListener("customer:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener(
        "customer:session-expired",
        handleSessionExpired
      );
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<Customer> => {
    const data = await customerApi.post<{
      customer: Customer;
      accessToken: string;
      refreshToken: string;
    }>("/customer/auth/login", { email, password });
    customerApi.setTokens(data.accessToken, data.refreshToken);
    setCustomer(data.customer);
    return data.customer;
  };

  const logout = () => {
    customerApi.clearTokens();
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider
      value={{ customer, loading, setCustomer, login, logout, refreshUser }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx)
    throw new Error(
      "useCustomerAuth must be used within CustomerAuthProvider"
    );
  return ctx;
}
