"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { cartApi } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  productImage: string;
  category: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  availableStock: number;
  hasArModel: boolean;
  arModelUrl?: string;
}

interface Cart {
  cartId: number;
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
}

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = async () => {
    if (!user || user.role !== "CUSTOMER") return;
    try {
      const res = await cartApi.get();
      setCart(res.data.data);
    } catch {}
  };

  useEffect(() => {
    if (user?.role === "CUSTOMER") refreshCart();
    else setCart(null);
  }, [user]);

  const addToCart = async (productId: number, quantity = 1) => {
    setIsLoading(true);
    try {
      const res = await cartApi.add(productId, quantity);
      setCart(res.data.data);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (cartItemId: number, quantity: number) => {
    const res = await cartApi.update(cartItemId, quantity);
    setCart(res.data.data);
  };

  const removeItem = async (cartItemId: number) => {
    const res = await cartApi.remove(cartItemId);
    setCart(res.data.data);
  };

  const clearCart = async () => {
    await cartApi.clear();
    setCart((prev) => prev ? { ...prev, items: [], totalItems: 0, totalQuantity: 0, totalAmount: 0 } : null);
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartCount: cart?.totalQuantity || 0,
      addToCart,
      updateItem,
      removeItem,
      clearCart,
      refreshCart,
      isLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};