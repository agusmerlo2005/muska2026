'use client';

import { createClient } from '@/lib/supabase/client';
import { Trash2, Edit3, AlertCircle } from 'lucide-react';

interface ProductTableProps {
  initialProducts: any[];
  onEdit: (product: any) => void;
  onRefresh: () => void;
}

export default function ProductTable({ initialProducts, onEdit, onRefresh }: ProductTableProps) {
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm('¿ELIMINAR PRODUCTO?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* VISTA MÓVIL: Tarjetas */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {initialProducts.map((prod) => (
          <div key={prod.id} className="border border-gray-100 p-4 flex gap-4 items-center bg-white">
            <img src={prod.image_url} className="w-16 h-16 object-cover grayscale shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest truncate">{prod.name}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-[9px] font-bold">${prod.price}</span>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm ${prod.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                  {prod.stock} U.
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => onEdit(prod)} className="p-2 text-gray-400"><Edit3 size={16} /></button>
              <button onClick={() => handleDelete(prod.id)} className="p-2 text-gray-300"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* VISTA DESKTOP: Tabla clásica */}
      <div className="hidden md:block overflow-hidden border border-gray-50">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-gray-50">
            {initialProducts.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="p-4 w-16"><img src={prod.image_url} className="w-10 h-10 object-cover grayscale" /></td>
                <td className="p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest">{prod.name}</p>
                  <p className="text-[8px] text-gray-300 uppercase font-bold mt-1">{prod.categories?.name}</p>
                </td>
                <td className="p-4 text-[10px] font-bold">${prod.price}</td>
                <td className="p-4 text-[9px] font-black tracking-widest">
                  <span className={prod.stock < 5 ? 'text-red-600' : 'text-gray-400'}>{prod.stock} UNIDADES</span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => onEdit(prod)} className="p-2 text-gray-300 hover:text-black transition-colors"><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete(prod.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}