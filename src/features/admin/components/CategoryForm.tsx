// src/features/admin/components/CategoryForm.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryForm() {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('none');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Cargamos las categorías existentes para poder elegirlas como "Padre"
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').is('parent_id', null);
      if (data) setCategories(data);
    };
    fetchCategories();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ 
          name, 
          slug: name.toLowerCase().trim().replace(/\s+/g, '-'),
          parent_id: parentId === 'none' ? null : parentId
        }]);

      if (error) throw error;

      setName('');
      setParentId('none');
      router.refresh();
      alert("Categoría/Subcategoría creada con éxito");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nombre</label>
        <input 
          placeholder="EJ: ALGODÓN O VELAS" 
          className="w-full border-b border-gray-100 py-3 text-[11px] font-bold uppercase outline-none focus:border-black"
          required 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">¿Es subcategoría de...?</label>
        <select 
          className="w-full border-b border-gray-100 py-3 text-[11px] font-bold uppercase outline-none focus:border-black bg-transparent"
          value={parentId}
          onChange={e => setParentId(e.target.value)}
        >
          <option value="none">NINGUNA (CATEGORÍA PRINCIPAL)</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <button 
        disabled={loading}
        className="w-full bg-black text-white p-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-gray-900 transition-all disabled:bg-gray-200"
      >
        {loading ? 'CARGANDO...' : 'GUARDAR'}
      </button>
    </form>
  );
}