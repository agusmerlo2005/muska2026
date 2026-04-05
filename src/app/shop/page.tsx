'use client';

// Esta línea es la que agregamos para que Vercel pase el build sin errores
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProductCard from '@/components/ui/ProductCard';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get('category');
  const currentPage = Number(searchParams.get('page')) || 1;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // categorías
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      setCategories(catData || []);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // 🔥 PRODUCTOS (SIN product_images)
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data: prodData, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      setProducts(prodData || []);
      setTotalCount(count || 0);
      setLoading(false);
    }

    fetchData();
  }, [selectedCategory, currentPage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/shop?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-white pt-32 pb-20 px-6 relative">
      <div className="mx-auto max-w-7xl">
        
        <header className="mb-12 flex justify-between items-end border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-black leading-none">
              Tienda
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold mt-4">
              {totalCount} Objetos
            </p>
          </div>

          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-3 border border-black px-6 py-3 hover:bg-black hover:text-white transition-all duration-500"
          >
            <span className="text-[10px] uppercase font-black tracking-widest">Filtrar</span>
            <SlidersHorizontal size={16} strokeWidth={1.5} />
          </button>
        </header>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-16">
              
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  category={'Objeto'}
                  image={product.image_url} // 🔥 ACA ESTÁ TODO
                />
              ))}

            </div>

            {totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-8 border-t border-gray-100 pt-10">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="disabled:opacity-10 hover:scale-110 transition-transform text-black"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <span className="text-[9px] font-black uppercase tracking-[0.5em]">
                  Pág. {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="disabled:opacity-10 hover:scale-110 transition-transform text-black"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </>
        )}

        {products.length === 0 && !loading && (
          <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">
              Próximamente más piezas
            </p>
          </div>
        )}
      </div>

      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[110]"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          <div className="fixed top-0 right-0 h-full w-full max-w-xs bg-white z-[120] p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-16">
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-black text-xs">Categorías</h3>
              <button onClick={() => setIsSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-6">
              <Link href="/shop">Todas</Link>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/shop?category=${cat.id}`}>
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </main>
  );
}