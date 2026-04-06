'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProductForm from '../../../features/admin/components/ProductForm';
import ProductTable from '../../../features/admin/components/ProductTable';
import { Search } from 'lucide-react';

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const supabase = createClient();

  const fetchData = async () => {
    const { data: cats } = await supabase.from('categories').select('*').order('name');
    const { data: prods } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
    setCategories(cats || []);
    setProducts(prods || []);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="mb-8 md:mb-16">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">INVENTARIO.</h1>
        
        <div className="mt-10 flex flex-col gap-6">
           <div className="flex items-center justify-between border-b border-black pb-2">
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">
               {editingProduct ? 'Modificar' : 'Nuevo Producto'}
             </h2>
             {editingProduct && (
               <button onClick={() => setEditingProduct(null)} className="text-[8px] font-bold uppercase text-red-500 underline">Cancelar</button>
             )}
           </div>

           {/* Buscador: En móvil ocupa todo el ancho abajo del título */}
           <div className="relative w-full">
             <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
             <input type="text" placeholder="BUSCAR POR NOMBRE..." className="w-full bg-transparent pl-6 py-2 text-[10px] font-bold uppercase outline-none border-b border-gray-100 focus:border-black" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-24">
        <div className="lg:col-span-4 order-2 lg:order-1">
           <ProductForm key={editingProduct?.id || 'new'} categories={categories} productToEdit={editingProduct} onSuccess={fetchData} />
        </div>
        <div className="lg:col-span-8 order-1 lg:order-2">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Existencias ({filteredProducts.length})</h2>
           </div>
           <ProductTable initialProducts={filteredProducts} onEdit={(prod) => { setEditingProduct(prod); window.scrollTo({top:0, behavior:'smooth'}); }} onRefresh={fetchData} />
        </div>
      </div>
    </div>
  );
}