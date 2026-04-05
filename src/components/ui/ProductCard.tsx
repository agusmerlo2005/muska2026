'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

export default function ProductCard({ id, name, price, category, image }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
  id,
  name,
  price,
  image: image || '',
  slug: id,
  quantity: 1
});
  };

  return (
    <div className="group flex flex-col w-full">
      <Link 
        href={`/product/${id}`} 
        className="relative aspect-square w-full overflow-hidden bg-gray-50 block"
      >
        {/* ✅ FIX REAL */}
        {typeof image === 'string' && image.trim() !== '' ? (
          <Image
            src={image}
            alt={name}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[8px] uppercase font-black text-gray-300">
            Sin imagen
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/5">
          <button 
            onClick={handleAddToCart}
            className="bg-white text-black p-4 rounded-full shadow-xl translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-black hover:text-white"
          >
            <Plus size={20} strokeWidth={2} />
          </button>
        </div>
      </Link>

      <div className="mt-4 flex flex-col gap-1">
        <span className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">
          {category}
        </span>
        <div className="flex justify-between items-baseline">
          <h3 className="text-[11px] uppercase font-bold tracking-tight text-black">
            {name}
          </h3>
          <p className="text-[11px] font-bold text-black">
            ${price.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}