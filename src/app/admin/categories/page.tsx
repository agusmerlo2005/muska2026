import { createClient } from '@/lib/supabase/server';
import { createCategory } from '@/features/admin/actions';
import { revalidatePath } from 'next/cache';

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from('categories').select('*').order('name');

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8 tracking-tighter">Gestionar Categorías</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Formulario de Creación */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
          <h2 className="text-xl font-semibold mb-4">Nueva Categoría</h2>
          <form action={createCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Nombre</label>
              <input 
                name="name" 
                placeholder="Ej: Sillas" 
                className="w-full border p-2 rounded-md bg-white focus:ring-2 focus:ring-black outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Slug (URL)</label>
              <input 
                name="slug" 
                placeholder="ej: sillas" 
                className="w-full border p-2 rounded-md bg-white focus:ring-2 focus:ring-black outline-none" 
                required 
              />
            </div>
            <button type="submit" className="w-full bg-black text-white p-3 rounded-md font-bold hover:bg-gray-800 transition-all">
              CREAR CATEGORÍA
            </button>
          </form>
        </div>

        {/* Listado de Existentes */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Categorías Activas</h2>
          <div className="space-y-2">
            {categories?.map((cat) => (
              <div key={cat.id} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm flex justify-between items-center">
                <span className="font-medium">{cat.name}</span>
                <span className="text-xs text-gray-400 font-mono tracking-wider">{cat.slug}</span>
              </div>
            ))}
            {categories?.length === 0 && (
              <p className="text-gray-400 italic">No hay categorías todavía.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}