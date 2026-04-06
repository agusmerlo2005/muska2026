'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
// Importación exacta según tu carpeta features/admin/components
import OrderList from '@/features/admin/components/OrderList';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TODOS');
  const supabase = createClient();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      if (filter !== 'TODOS') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error en ventas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  return (
    <div className="min-h-screen bg-white p-6 pb-32">
      <header className="mb-10">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none mb-8 text-black">VENTAS.</h1>
        
        {/* Filtros para el iPhone */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          {['TODOS', 'PENDIENTE', 'ENVIADO', 'ENTREGADO'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 border transition-all ${
                filter === f ? 'bg-black text-white border-black' : 'bg-transparent text-gray-400 border-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-xl">
        {loading ? (
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-200 animate-pulse">Cargando historial...</p>
        ) : (
          <OrderList orders={orders} onRefresh={fetchOrders} />
        )}
      </div>
    </div>
  );
}