'use client';

import { createClient } from '@/lib/supabase/client';

interface OrderListProps {
  orders: any[];
  onRefresh: () => void;
}

export default function OrderList({ orders, onRefresh }: OrderListProps) {
  const supabase = createClient();

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (!error) onRefresh();
  };

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-white border border-gray-100 p-6 shadow-sm rounded-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block">ID: {order.id.slice(0, 5)}</span>
              <h3 className="text-sm font-black uppercase italic tracking-tight">{order.customer_name}</h3>
            </div>
            <span className={`text-[8px] font-black px-3 py-1 rounded-full ${
              order.status === 'PENDIENTE' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'
            }`}>
              {order.status}
            </span>
          </div>

          <div className="border-y border-gray-50 py-4 mb-6 space-y-2">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-[11px] uppercase font-medium italic">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-bold text-black">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Total</p>
              <p className="text-xl font-black italic tracking-tighter">${order.total_amount?.toLocaleString()}</p>
            </div>
            {order.status === 'PENDIENTE' && (
              <button 
                onClick={() => updateStatus(order.id, 'ENVIADO')}
                className="bg-black text-white px-6 py-3 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                Despachar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}