'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  stock?: number;
}

export default function ProductCard({ id, name, price, category, image, stock = 0 }: ProductCardProps) {
  const currentStock = Number(stock);
  const isOutOfStock = currentStock <= 0;

  return (
    <div className={`group flex flex-col w-full ${isOutOfStock ? 'pointer-events-none' : ''}`}>
      <Link 
        href={`/product/${id}`} 
        className="relative aspect-square w-full overflow-hidden bg-gray-50 block"
      >
        {typeof image === 'string' && image.trim() !== '' ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-40' : 'opacity-100'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[8px] uppercase font-black text-gray-300">
            Sin imagen
          </div>
        )}

        {/* ETIQUETAS DE STOCK */}
        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-black text-white text-[10px] font-black uppercase px-4 py-2 tracking-[0.3em]">
              Agotado
            </div>
          </div>
        ) : currentStock <= 3 ? (
          <div className="absolute top-2 left-2 bg-white border border-black text-black text-[8px] font-black uppercase px-2 py-1 tracking-widest z-10">
            Últimos {currentStock}
          </div>
        ) : null}

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/5" />
      </Link>

      <div className="mt-4 flex flex-col gap-1">
        <div className="flex justify-between items-center gap-2">
          <span className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">
            {category}
          </span>
          {!isOutOfStock && currentStock > 3 && (
            <span className="text-[8px] uppercase font-bold text-gray-300 tracking-widest whitespace-nowrap shrink-0">
              Stock: {currentStock}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <h3 className="text-[11px] uppercase font-bold tracking-tight text-black min-w-0 break-words">
            {name}
          </h3>
          <p className="text-[11px] font-bold text-black whitespace-nowrap sm:shrink-0">
            ${price.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}