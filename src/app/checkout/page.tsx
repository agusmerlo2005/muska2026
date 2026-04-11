'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Truck, Store, MessageCircle } from 'lucide-react'; 

export default function CheckoutPage() {
  const { cart } = useCart();
  const totalProducts = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const [deliveryMethod, setDeliveryMethod] = useState<'domicilio' | 'retiro'>('domicilio'); 

  // Número de Jazmín ya configurado
  const WHATSAPP_NUMBER = "5493471572730"; 

  const handleWhatsAppContact = () => {
    // Si el carrito está vacío, no hace nada
    if (cart.length === 0) return;

    // Construir lista de productos para el mensaje
    const productList = cart.map(item => `- ${item.name} (x${item.quantity})`).join('\n');
    
    const message = `¡Hola Jazmín! Vengo de la web y quiero coordinar el envío de mi compra.\n\n` +
                    ` MÉTODO: ${deliveryMethod === 'domicilio' ? 'Envío a Domicilio' : 'Retiro Local'}\n` +
                    ` PEDIDO:\n${productList}\n\n` +
                    ` TOTAL: $${totalProducts.toLocaleString()}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* COLUMNA IZQUIERDA: SELECCIÓN DE ENTREGA */}
        <div>
          <h2 className="text-[10px] uppercase font-black tracking-[0.4em] text-gray-400 mb-2">Finalizar Compra</h2>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-12 text-black">Entrega y Datos.</h1>
          
          <div className="space-y-8">
            {/* MÉTODOS DE ENVÍO */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setDeliveryMethod('domicilio')}
                className={`flex flex-col items-center gap-3 p-6 border-2 transition-all ${deliveryMethod === 'domicilio' ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
              >
                <Truck size={24} strokeWidth={1.5} />
                <span className="text-[9px] uppercase font-black tracking-widest text-center">A Domicilio</span>
              </button>

              <button 
                type="button"
                onClick={() => setDeliveryMethod('retiro')}
                className={`flex flex-col items-center gap-3 p-6 border-2 transition-all ${deliveryMethod === 'retiro' ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
              >
                <Store size={24} strokeWidth={1.5} />
                <span className="text-[9px] uppercase font-black tracking-widest text-center">Retiro Local</span>
              </button>
            </div>

            {/* BOTÓN WHATSAPP */}
            <div className="bg-gray-50 p-8 border border-gray-100 space-y-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-black italic">Atención Personalizada</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Hacé clic abajo para enviarle tu pedido a Jazmín. Ella te ayudará a coordinar el pago y los detalles del envío.
              </p>
              <div className="pt-4">
                 <button 
                  onClick={handleWhatsAppContact}
                  disabled={cart.length === 0}
                  className="w-full bg-[#25D366] text-white py-6 text-[10px] uppercase font-black tracking-[0.4em] hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-100 active:scale-[0.98]"
                >
                  <MessageCircle size={18} fill="white" />
                  Enviar Pedido por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN */}
        <div className="bg-gray-50 p-10 lg:sticky lg:top-32 h-fit border border-gray-100">
          <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-black mb-8 border-b pb-4">Tu Pedido</h3>
          
          <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm gap-4">
                <div className="flex gap-4 items-center">
                  <div className="relative h-16 w-16 bg-white flex-shrink-0 border border-gray-100">
                    <img src={item.image} alt={item.name} className="object-cover h-full w-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold uppercase text-[11px] tracking-tight leading-tight italic">{item.name}</span>
                    <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Cant: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-[11px]">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4">
             <div className="flex justify-between items-center pt-4 border-t-2 border-black">
                <span className="text-[10px] uppercase font-black tracking-[0.3em] italic">Total Productos</span>
                <span className="text-3xl font-black italic">${totalProducts.toLocaleString()}</span>
             </div>
             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
               * El costo de envío se calcula por chat según tu zona.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}