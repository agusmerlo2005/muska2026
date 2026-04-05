'use client';

import { useCart } from '@/features/cart/store';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    product_images?: { url: string }[];
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCart((state) => state.addItem);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.product_images?.[0]?.url || '',
      quantity: 1
    });
  };

  return (
    <button 
      onClick={handleAdd}
      className="w-full bg-black text-white py-6 font-bold uppercase text-[11px] tracking-[0.3em] hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg"
    >
      Añadir a la bolsa
    </button>
  );
}