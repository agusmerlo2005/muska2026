import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Oify<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

type Oify<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export const useCart = create<CartStore>((set) => ({
  items: [],
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  addItem: (product) => set((state) => {
    const existingItem = state.items.find((item) => item.id === product.id);
    if (existingItem) {
      return {
        items: state.items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    return { items: [...state.items, { ...product, quantity: 1 } as CartItem] };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
    ).filter(item => item.quantity > 0),
  })),
  clearCart: () => set({ items: [] }),
}));