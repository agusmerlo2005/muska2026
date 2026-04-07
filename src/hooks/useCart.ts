'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug: string;
  stock: number;
}

interface CartStore {
  cart: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      isOpen: false,
      
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((i) => i.id === item.id);

        if (existingItem) {
          // Calculamos la nueva cantidad sumando la que ya había + la nueva
          const totalRequested = existingItem.quantity + item.quantity;
          
          if (totalRequested <= existingItem.stock) {
            set({
              cart: currentCart.map((i) =>
                i.id === item.id ? { ...i, quantity: totalRequested } : i
              ),
            });
          } else {
            // Si se pasa, lo dejamos en el máximo
            set({
              cart: currentCart.map((i) =>
                i.id === item.id ? { ...i, quantity: i.stock } : i
              ),
            });
          }
        } else {
          // Si es nuevo, respetamos la cantidad que viene (item.quantity)
          // pero siempre chequeando que no supere el stock
          const initialQuantity = Math.min(item.quantity, item.stock);
          if (item.stock > 0) {
            set({ cart: [...currentCart, { ...item, quantity: initialQuantity }] });
          }
        }
      },

      removeItem: (id) => {
        set({ cart: get().cart.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) return;
        const currentCart = get().cart;
        const item = currentCart.find((i) => i.id === id);

        if (item && quantity <= item.stock) {
          set({
            cart: currentCart.map((i) => (i.id === id ? { ...i, quantity } : i)),
          });
        }
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'muska-cart-storage',
    }
  )
);