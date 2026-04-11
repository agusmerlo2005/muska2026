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

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-gray-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">No hay pedidos registrados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-white border border-gray-100 p-6 shadow-sm rounded-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                {new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <h3 className="text-sm font-black uppercase italic tracking-tight">
                {/* Usamos el email si no tenemos el nombre cargado */}
                {order.customer_name || order.customer_email || 'Cliente Muska'}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">{order.customer_email}</p>
            </div>
            <span className={`text-[8px] font-black px-3 py-1 rounded-full ${
              order.status === 'approved' || order.status === 'ENTREGADO' 
                ? 'bg-green-50 text-green-600' 
                : 'bg-orange-50 text-orange-500'
            }`}>
              {order.status?.toUpperCase()}
            </span>
          </div>

          <div className="border-y border-gray-50 py-4 mb-6 space-y-3">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-[11px] uppercase font-medium italic leading-tight">
                <span className="max-w-[70%] text-gray-600">
                  {item.quantity || item.quantity}x {item.title || item.name}
                </span>
                <span className="font-bold text-black">
                  ${Number(item.unit_price || item.price).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Monto Total</p>
              <p className="text-2xl font-black italic tracking-tighter text-black">
                ${Number(order.total_amount).toLocaleString()}
              </p>
            </div>
            
            {/* Si el pago está recién aprobado, damos la opción de marcar como enviado */}
            {(order.status === 'approved' || order.status === 'TODOS') && (
              <button 
                onClick={() => updateStatus(order.id, 'ENVIADO')}
                className="bg-black text-white px-6 py-3 text-[9px] font-black uppercase tracking-widest active:scale-95 hover:bg-gray-900 transition-all"
              >
                Marcar Enviado
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}