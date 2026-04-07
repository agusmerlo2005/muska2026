'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ProductCard from '@/components/ui/ProductCard';

export default function HomePage() {
  const [animate, setAnimate] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    setAnimate(true);

    async function getProducts() {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name)')
        .limit(4);

      setProducts(data || []);
    }

    getProducts();
  }, []);

  return (
    <main className="bg-white">
      
      {/* HERO */}
      <section className="relative h-[85vh] w-full flex items-center justify-center bg-gray-50 overflow-hidden px-6">
        
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/image_2.jpg"
            alt="Muska Deco"
            fill
            className="object-cover opacity-10 grayscale"
            priority
          />
        </div>
        
        <div className={`z-10 text-center flex flex-col items-center transition-all duration-1000 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          <h1 className="text-[10vw] md:text-[6rem] lg:text-[7.5rem] font-black tracking-[-0.05em] uppercase leading-[0.9] text-black">
            lo que <br /> necesitás <br /> para tu hogar.
          </h1>
          
          <p className="text-[10px] uppercase tracking-[0.6em] font-bold text-gray-400 mt-8 mb-12">
            Muska home & deco — Rosario — Armstrong
          </p>

          <Link href="/shop" className="group relative inline-block border-2 border-black px-12 py-4 overflow-hidden bg-white">
            <span className="relative z-10 text-[10px] uppercase font-black tracking-[0.3em] text-black group-hover:text-white transition-colors duration-500">
              Ver Catálogo
            </span>
            <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </Link>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        
        <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-8">
          <h2 className="text-4xl font-black uppercase tracking-tighter">
            Destacados.
          </h2>
          <Link href="/shop" className="text-[10px] uppercase font-black border-b-2 border-black pb-1">
            Ir a la tienda
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              category={p.categories?.name || 'Objeto'}
              image={p.image_url}
              stock={p.stock} // ✅ AHORA SÍ: El inicio ya sabe cuánto stock hay
            />
          ))}

        </div>
      </section>
    </main>
  );
}