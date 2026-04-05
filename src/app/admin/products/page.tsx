import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/features/admin/components/ProductForm';

export default async function AdminProductsPage() {
  const supabase = await createClient();

  // Necesitamos las categorías para el selector del formulario
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  // Traemos los productos existentes para listarlos (Opcional pero útil)
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      categories (name)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Panel de Productos</h1>
        <p className="text-gray-500">Carga y gestiona el stock de MUSKA</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Formulario */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Nuevo Producto</h2>
          <ProductForm categories={categories || []} />
        </div>

        {/* Columna Derecha: Listado */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Productos Existentes</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm">
                <tr>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Categoría</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {products?.map((prod) => (
                  <tr key={prod.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{prod.name}</td>
                    <td className="p-4">${prod.price}</td>
                    <td className="p-4">{prod.stock} u.</td>
                    <td className="p-4 text-gray-500">
                      {(prod.categories as any)?.name || 'Sin categoría'}
                    </td>
                  </tr>
                ))}
                {products?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                      No hay productos cargados todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}