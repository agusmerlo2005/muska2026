'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryForm() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ 
          name, 
          slug: name.toLowerCase().trim().replace(/\s+/g, '-') 
        }]);

      if (error) throw error;

      setName('');
      router.refresh();
      alert("Categoría creada con éxito");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        placeholder="NOMBRE DE LA CATEGORÍA" 
        className="w-full border-b border-gray-100 py-3 text-[11px] font-bold uppercase outline-none focus:border-black"
        required 
        value={name} 
        onChange={e => setName(e.target.value)} 
      />
      <button 
        disabled={loading}
        className="w-full bg-black text-white p-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-gray-900 transition-all disabled:bg-gray-200"
      >
        {loading ? 'CARGANDO...' : 'CREAR CATEGORÍA'}
      </button>
    </form>
  );
}