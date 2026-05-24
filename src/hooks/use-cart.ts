"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

function getCartStorageKey(): string {
  try {
    const saved = localStorage.getItem("c_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.phone) return `ddcm-cart-${parsed.phone}`;
    }
  } catch {}
  return "ddcm-cart-guest";
}

export interface CartItemData {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItemData[];
  addItem: (item: Omit<CartItemData, "id" | "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, id: `cart-${item.productId}`, quantity }],
          };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    { name: getCartStorageKey() }
  )
);
