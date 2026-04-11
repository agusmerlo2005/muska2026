'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import OrderList from '@/features/admin/components/OrderList';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TODOS');
  const supabase = createClient();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filter !== 'TODOS') {
        // Mapeo exacto para la base de datos
        const statusMap: { [key: string]: string } = {
          'PENDIENTE': 'pending',
          'ENVIADO': 'ENVIADO',
          'ENTREGADO': 'ENTREGADO'
        };
        query = query.eq('status', statusMap[filter] || filter);
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
        <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none mb-8 text-black">
          VENTAS.
        </h1>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          {['TODOS', 'PENDIENTE', 'ENVIADO', 'ENTREGADO'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 border transition-all ${
                filter === f 
                  ? 'bg-black text-white border-black' 
                  : 'bg-transparent text-gray-400 border-gray-100 hover:border-black hover:text-black'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-xl">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 w-full bg-gray-50 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <OrderList orders={orders} onRefresh={fetchOrders} />
        )}
      </div>
    </div>
  );
}