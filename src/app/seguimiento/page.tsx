'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Package, Truck, CheckCircle, Search } from 'lucide-react';

export default function TrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId) // O puedes buscar por customer_email
      .single();
    
    setOrder(data);
    setLoading(false);
  };

  const steps = [
    { label: 'PAGADO', icon: Package, key: 'approved' },
    { label: 'ENVIADO', icon: Truck, key: 'ENVIADO' },
    { label: 'ENTREGADO', icon: CheckCircle, key: 'ENTREGADO' }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Seguí tu pedido.</h1>
        
        <form onSubmit={handleTrack} className="flex gap-2 mb-12">
          <input 
            type="text" 
            placeholder="ID DE TU PEDIDO (Ej: 123...)" 
            className="flex-1 border-b-2 border-gray-100 py-4 outline-none focus:border-black uppercase text-sm font-bold"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button className="bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest">
            {loading ? 'Buscando...' : <Search size={18} />}
          </button>
        </form>

        {order && (
          <div className="border border-gray-100 p-10 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between mb-12">
              {steps.map((step, index) => {
                const isCurrent = order.status === step.key;
                const isPast = steps.findIndex(s => s.key === order.status) > index;
                const Icon = step.icon;

                return (
                  <div key={step.label} className="flex flex-col items-center gap-3 w-1/3 relative">
                    <div className={`z-10 p-4 rounded-full border-2 transition-all ${isCurrent || isPast ? 'bg-black border-black text-white' : 'bg-white border-gray-100 text-gray-200'}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-[9px] font-black tracking-widest ${isCurrent ? 'text-black' : 'text-gray-300'}`}>
                      {step.label}
                    </span>
                    {/* Línea conectora */}
                    {index < steps.length - 1 && (
                      <div className="absolute h-[2px] w-full bg-gray-100 top-7 left-1/2 -z-0" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-50 p-6 space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase">Detalle del envío</p>
              <p className="text-sm font-bold uppercase italic">Hola, {order.customer_name}</p>
              <p className="text-[11px] text-gray-500 leading-relaxed uppercase">
                {order.status === 'approved' && "Estamos preparando tus productos con mucho amor. Te avisaremos cuando Jazmín lo despache."}
                {order.status === 'ENVIADO' && "¡Tu pedido ya está en camino! En breve llegará a tu domicilio."}
                {order.status === 'ENTREGADO' && "¡Pedido entregado! Gracias por confiar en Muska Home & Deco."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}