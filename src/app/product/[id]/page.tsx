'use client';

import { createClient } from '@/lib/supabase/client'; 
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { Plus, Minus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  const addItem = useCart((state) => state.addItem);
  const openCart = useCart((state) => state.openCart);
  const supabase = createClient();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (!error && data) setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id, supabase]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <span className="text-[10px] uppercase font-black tracking-[0.5em] animate-pulse text-black">
        Muska Home...
      </span>
    </div>
  );

  if (!product) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white text-black">
      <p className="text-[10px] uppercase font-black text-gray-400">Producto no encontrado</p>
      <Link href="/shop" className="text-[10px] uppercase font-black underline">Volver</Link>
    </div>
  );

  const finalImage = product.image_url || product.image || product.imagen || "https://placehold.co/800x800/f3f3f3/a3a3a3?text=Muska+Home";
  const productStock = Number(product.stock || 0);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: finalImage,
      slug: product.id,
      quantity: quantity, // ✅ Manda el número exacto del selector
      stock: productStock
    });
    openCart();
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 text-black">
      <div className="max-w-7xl mx-auto">
        <Link href="/shop" className="inline-flex items-center gap-2 text-[9px] uppercase font-black tracking-[0.3em] mb-12 text-black hover:gap-4 transition-all">
          <ArrowLeft size={14} /> Volver a productos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="relative aspect-square bg-[#f9f9f9] border border-gray-100 overflow-hidden flex items-center justify-center">
            <img src={finalImage} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-gray-400 mb-6">
              {product.category || 'Home & Deco'}
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-none">
              {product.name}
            </h1>
            <p className="text-3xl font-bold mb-10">
              ${Number(product.price).toLocaleString()}
            </p>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md font-light mb-12">
              {product.description || "Pieza exclusiva de Muska Home."}
            </p>
            
            <div className="flex flex-col gap-6 max-w-sm">
              {productStock > 0 ? (
                <>
                  <div className="flex items-center justify-between border border-gray-200 p-5">
                    <span className="text-[9px] uppercase font-black text-gray-400">Cantidad</span>
                    <div className="flex items-center gap-8">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-black w-4 text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(productStock, quantity + 1))}
                        disabled={quantity >= productStock}
                        className="disabled:opacity-20"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleAddToCart}
                    className="w-full bg-black text-white py-6 text-[11px] uppercase font-black tracking-[0.5em] hover:bg-zinc-900 transition-colors"
                  >
                    Añadir al carrito
                  </button>
                </>
              ) : (
                <div className="w-full bg-gray-50 text-gray-400 py-6 text-center text-[11px] uppercase font-black tracking-[0.5em] border border-dashed border-gray-200">
                  Sin stock disponible
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}