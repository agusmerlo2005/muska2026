import { createClient } from '@/lib/supabase/server';
import CategoryForm from '../../../features/admin/components/CategoryForm';
import CategoryTable from '../../../features/admin/components/CategoryTable';

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen bg-white">
      <header className="mb-12 md:mb-20">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">
          CATEGORÍAS.
        </h1>
        <p className="text-[9px] uppercase font-bold text-gray-400 tracking-[0.4em] mt-3">
          Organización del catálogo
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
        
        <div className="lg:col-span-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b border-black pb-2 inline-block">
            Nueva categoría
          </h2>
          <CategoryForm />
        </div>

        <div className="lg:col-span-8 overflow-hidden">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b border-black pb-2 inline-block">
            Listado
          </h2>
          <div className="overflow-x-auto">
            <CategoryTable initialCategories={categories || []} />
          </div>
        </div>

      </div>
    </div>
  );
}