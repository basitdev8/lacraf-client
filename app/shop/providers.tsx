"use client";

import type { ReactNode } from "react";
import { CustomerAuthProvider } from "@/context/customer-auth-context";
import { CartProvider } from "@/context/cart-context";

export function ShopProviders({ children }: { children: ReactNode }) {
  return (
    <CustomerAuthProvider>
      <CartProvider>{children}</CartProvider>
    </CustomerAuthProvider>
  );
}
