'use client';

import { createClient } from '@/lib/supabase/client';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CategoryTable({ initialCategories }: { initialCategories: any[] }) {
  const supabase = createClient();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('¿BORRAR ESTA CATEGORÍA? (Ojo: si hay productos usándola puede fallar)')) return;

    const { error } = await supabase.from('categories').delete().eq('id', id);
    
    if (error) {
      alert("No se puede borrar: verificá que no tenga productos asociados.");
    } else {
      router.refresh();
    }
  };

  return (
    <div className="bg-white border border-gray-100">
      <table className="w-full text-left border-collapse">
        <tbody className="divide-y divide-gray-50">
          {initialCategories.map((cat) => (
            <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors group">
              <td className="p-4 text-[11px] font-black uppercase tracking-widest text-black">
                {cat.name}
              </td>
              <td className="p-4 text-right">
                <button 
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-gray-200 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}