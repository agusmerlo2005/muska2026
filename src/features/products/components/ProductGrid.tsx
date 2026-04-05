'use client';

import Link from 'next/link';

export default function ProductGrid({ products }: { products: any[] }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((product) => {
        // Usamos la misma lógica que el detalle donde SÍ se ve la foto
        const imagenFinal = product.image_url || product.image || product.imagen;

        return (
          <Link key={product.id} href={`/product/${product.id}`} className="group block">
            <div className="aspect-square w-full overflow-hidden bg-[#f9f9f9] border border-gray-100">
              {imagenFinal ? (
                <img
                  src={imagenFinal}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[8px] uppercase font-black text-gray-300">
                  Sin Foto
                </div>
              )}
            </div>
            
            <div className="mt-4 flex flex-col gap-1 text-black">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                {product.categories?.name || 'Muska Deco'}
              </span>
              <div className="flex justify-between items-center">
                <h3 className="text-[11px] font-black uppercase">{product.name}</h3>
                <p className="text-[11px] font-bold">
                  ${Number(product.price).toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}