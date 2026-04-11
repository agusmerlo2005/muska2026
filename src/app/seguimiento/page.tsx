'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Package, Truck, CheckCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchOrder = async (id: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    const data = await fetchOrder(orderId);
    setOrder(data);
    setLoading(false);
  };

  // ✅ LÓGICA REALTIME: Escucha cambios en la base de datos
  useEffect(() => {
    if (!order?.id) return;

    // Suscribirse a cambios en la fila específica de esta orden
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
          setOrder(payload.new); // Actualiza la visual automáticamente
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  const steps = [
    { label: 'PAGADO', icon: Package, key: 'approved' },
    { label: 'ENVIADO', icon: ENVIADO_STATUS, key: 'ENVIADO' }, // Ajustado a tus estados del admin
    { label: 'ENTREGADO', icon: CheckCircle, key: 'ENTREGADO' }
  ];

  // Helper para saber en qué nivel de la línea de tiempo estamos
  const getStatusIndex = (status: string) => {
    if (status === 'approved' || status === 'pending') return 0;
    if (status === 'ENVIADO') return 1;
    if (status === 'ENTREGADO') return 2;
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
          <button className="bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
            {loading ? 'BUSCANDO...' : 'BUSCAR'}
          </button>
        </form>

        <AnimatePresence>
          {order && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-100 p-8 md:p-12 relative overflow-hidden"
            >
              {/* LÍNEA DE TIEMPO */}
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
                      {order.status === 'approved' ? 'PREPARANDO PEDIDO' : order.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Cliente</p>
                    <p className="text-xs font-bold uppercase">{order.customer_name}</p>
                  </div>
                </div>
                
                <p className="text-[11px] text-gray-500 leading-relaxed uppercase font-medium">
                  {order.status === 'approved' && "Jazmín ya recibió tu pago y está preparando el paquete. Te avisaremos cuando sea despachado."}
                  {order.status === 'ENVIADO' && "¡Tu pedido está en camino! Recordá tener tu teléfono a mano por cualquier coordinación del correo."}
                  {order.status === 'ENTREGADO' && "El pedido figura como entregado. ¡Esperamos que disfrutes tus productos de Muska!"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const ENVIADO_STATUS = Truck; // Alias para el icono