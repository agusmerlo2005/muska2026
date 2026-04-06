import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Definimos exactamente qué forma tiene un producto
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// 2. Definimos TODO lo que la store puede hacer (Interface)
interface CartStore {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

// 3. Creamos la store con persistencia
export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      isOpen: false, // Por defecto cerrado
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) => set((state) => {
        const existingItem = state.cart.find((i) => i.id === item.id);
        if (existingItem) {
          return {
            cart: state.cart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            isOpen: true,
          };
        }
        return { cart: [...state.cart, item], isOpen: true };
      }),
      removeItem: (id) => set((state) => ({
        cart: state.cart.filter((i) => i.id !== id),
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        cart: state.cart.map((i) =>
          i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i
        ),
      })),
      clearCart: () => set({ cart: [] }),
    }),
    { name: 'cart-storage' }
  )
);