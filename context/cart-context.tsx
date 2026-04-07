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
import type { Cart, CartItem } from "@/lib/customer-types";

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, variantId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const fetchCart = useCallback(async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("customerAccessToken")
          : null;
      if (!token) {
        setItems([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      const data = await customerApi.get<Cart>("/cart");
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      // If unauthorized or any error, keep cart empty
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cart on mount if customer is logged in
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Re-fetch when customer logs in (token appears)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "customerAccessToken") fetchCart();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [fetchCart]);

  const addItem = async (
    productId: string,
    variantId: string,
    quantity: number
  ) => {
    await customerApi.post("/cart/items", { productId, variantId, quantity });
    await fetchCart();
  };

  const updateItem = async (itemId: string, quantity: number) => {
    await customerApi.patch(`/cart/items/${itemId}`, { quantity });
    await fetchCart();
  };

  const removeItem = async (itemId: string) => {
    await customerApi.delete(`/cart/items/${itemId}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await customerApi.delete("/cart");
    setItems([]);
    setTotal(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        itemCount,
        loading,
        drawerOpen,
        setDrawerOpen,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
