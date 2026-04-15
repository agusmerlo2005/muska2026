'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Package, ShoppingBag, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchOrder = async (id: string) => {
    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) return null;
    return data;
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setError(null);
    const data = await fetchOrder(orderId);
    
    if (!data) {
      setError('ID DE PEDIDO NO ENCONTRADO');
      setOrder(null);
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!order?.id) return;

    const channel = supabase
      .channel(`order-changes-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          console.log('Cambio detectado en tiempo real:', payload.new);
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id, supabase]);

  // Pasos actualizados a la nueva temática
  const steps = [
    { label: 'PENDIENTE', icon: Package, key: 'PENDIENTE' },
    { label: 'PREPARADO', icon: ShoppingBag, key: 'PREPARADO' },
    { label: 'ENTREGADO', icon: CheckCircle, key: 'ENTREGADO' }
  ];

  const getStatusIndex = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'APPROVED' || s === 'PENDING') return 0;
    if (s === 'PREPARADO') return 1;
    if (s === 'ENTREGADO') return 2;
    return 0;
  };

  const currentIndex = getStatusIndex(order?.status);

  return (
    <div className="min-h-screen bg-white pt-40 px-6 pb-20">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-[10px] uppercase font-black tracking-[0.5em] text-gray-400 mb-4">Tracking</h2>
        <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-12">Seguí tu pedido.</h1>
        
        <form onSubmit={handleTrack} className="flex gap-2 mb-16">
          <input 
            type="text" 
            placeholder="INGRESÁ EL ID DE TU PEDIDO" 
            className="flex-1 border-b-2 border-gray-100 py-4 outline-none focus:border-black uppercase text-sm font-bold transition-all"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            {loading ? 'BUSCANDO...' : 'BUSCAR'}
          </button>
        </form>

        {error && <p className="text-[10px] font-black text-red-500 mb-10 tracking-widest uppercase">{error}</p>}

        <AnimatePresence>
          {order && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-100 p-8 md:p-12 relative overflow-hidden"
            >
              <div className="flex justify-between mb-16 relative">
                <div className="absolute top-7 left-0 w-full h-[1px] bg-gray-100 -z-0" />
                
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isPast = currentIndex > index;
                  const isCurrent = currentIndex === index;

                  return (
                    <div key={step.label} className="flex flex-col items-center gap-4 w-1/3 z-10">
                      <div className={`p-4 rounded-full border-2 transition-all duration-500 ${
                        isCurrent || isPast 
                        ? 'bg-black border-black text-white' 
                        : 'bg-white border-gray-100 text-gray-200'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <span className={`text-[9px] font-black tracking-[0.2em] ${isCurrent ? 'text-black' : 'text-gray-300'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-50 p-8 space-y-4 border-l-4 border-black">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Estado Actual</p>
                    <p className="text-xl font-black uppercase italic tracking-tighter text-black">
                      {currentIndex === 0 ? 'PEDIDO RECIBIDO' : order.status?.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Cliente</p>
                    <p className="text-xs font-bold uppercase">{order.customer_name}</p>
                  </div>
                </div>
                
                <p className="text-[11px] text-gray-500 leading-relaxed uppercase font-medium">
                  {currentIndex === 0 && "Recibimos tu pedido correctamente. Jazmín ya está al tanto y comenzará a prepararlo a la brevedad."}
                  {order.status?.toUpperCase() === 'PREPARADO' && "¡Tu pedido ya está listo! Podés pasar a retirarlo o Jazmín te avisará para coordinar la entrega."}
                  {order.status?.toUpperCase() === 'ENTREGADO' && "El pedido figura como entregado. ¡Esperamos que disfrutes tus productos de Muska!"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}