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
  stock: number; // ✅ Paso 1: Agregamos el stock a la interfaz
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
          // ✅ Paso 2: Validar stock antes de sumar en el botón de la tienda
          if (existingItem.quantity < existingItem.stock) {
            const updatedCart = currentCart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            );
            set({ cart: updatedCart });
          }
        } else {
          // Si el producto es nuevo, solo se agrega si hay al menos 1 en stock
          if (item.stock > 0) {
            set({ cart: [...currentCart, { ...item, quantity: 1 }] });
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

        // ✅ Paso 3: Bloqueo total. Si la nueva cantidad supera el stock, no hace nada.
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