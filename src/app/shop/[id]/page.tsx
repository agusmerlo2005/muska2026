'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { Plus, Minus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  const addItem = useCart((state) => state.addItem);
  const supabase = createClient();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <span className="text-[10px] uppercase font-black tracking-[0.5em] animate-pulse">Cargando...</span>
    </div>
  );

  if (!product) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Producto no encontrado</p>
      <Link href="/shop" className="text-[10px] uppercase font-black underline underline-offset-8">Volver a la tienda</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Botón Volver */}
        <Link href="/shop" className="inline-flex items-center gap-2 text-[9px] uppercase font-black tracking-widest mb-12 hover:gap-4 transition-all">
          <ArrowLeft size={14} /> Volver a la selección
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          
          {/* Columna Imagen */}
          <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
            <Image
              src={product.image_url || product.image || '/images/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Columna Información */}
          <div className="flex flex-col justify-center">
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-gray-400 mb-4">
              {product.category}
            </span>
            
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black mb-6 leading-none">
              {product.name}
            </h1>

            <p className="text-2xl font-bold text-black mb-10">
              ${product.price.toLocaleString()}
            </p>

            <div className="space-y-8 mb-12">
              <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                {product.description || "Inspirado en el diseño minimalista funcional, este producto combina materiales de alta calidad con una estética industrial robusta. Perfecto para espacios contemporáneos."}
              </p>
            </div>

            {/* Selector de Cantidad y Botón */}
            <div className="flex flex-col gap-6 max-w-sm">
              <div className="flex items-center justify-between border border-gray-100 p-4">
                <span className="text-[9px] uppercase font-black tracking-widest">Cantidad</span>
                <div className="flex items-center gap-6">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-gray-400 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-black w-4 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="hover:text-gray-400 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => {
                  for(let i = 0; i < quantity; i++) {
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image_url || product.image,
                      slug: product.id,
                      quantity: 1
                    });
                  }
                }}
                className="w-full bg-black text-white py-6 text-[10px] uppercase font-black tracking-[0.5em] hover:bg-gray-800 transition-colors"
              >
                Añadir al carrito
              </button>
            </div>

            {/* Detalles Extra */}
            <div className="mt-16 pt-10 border-t border-gray-50 grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-[9px] uppercase font-black tracking-widest text-black mb-2">Envío</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-tighter">Rosario, Armstrong y envíos a todo el país.</p>
              </div>
              <div>
                <h4 className="text-[9px] uppercase font-black tracking-widest text-black mb-2">Garantía</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-tighter">Calidad certificada Muska.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}