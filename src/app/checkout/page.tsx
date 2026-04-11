'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Truck, Store, MessageCircle } from 'lucide-react'; 

export default function CheckoutPage() {
  const { cart } = useCart();
  const totalProducts = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'domicilio' | 'retiro'>('domicilio'); 
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const WHATSAPP_NUMBER = "5493471572730"; 

  // Función para WhatsApp (Solo para Domicilio)
  const handleWhatsAppContact = () => {
    const productList = cart.map(item => `- ${item.name} (x${item.quantity})`).join('\n');
    const message = `¡Hola Jazmín! Quiero coordinar mi compra y el envío a domicilio.\n\n` +
                    ` PEDIDO:\n${productList}\n\n` +
                    ` TOTAL PRODUCTOS: $${totalProducts.toLocaleString()}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  // Función para Mercado Pago (Solo para Retiro Local)
  const handleSubmitRetiro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cart, 
          formData: { ...formData, address: 'Retiro en Local', province: 'Santa Fe' }, 
          total: totalProducts,
          shippingCost: 0 
        }),
      });
      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert('Hubo un error al procesar el pago.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        <div>
          <h2 className="text-[10px] uppercase font-black tracking-[0.4em] text-gray-400 mb-2">Finalizar Compra</h2>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-12 text-black">Entrega y Datos.</h1>
          
          {/* MÉTODOS DE ENVÍO */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <button 
              type="button"
              onClick={() => setDeliveryMethod('domicilio')}
              className={`flex flex-col items-center gap-3 p-6 border-2 transition-all ${deliveryMethod === 'domicilio' ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
            >
              <Truck size={24} strokeWidth={1.5} />
              <span className="text-[9px] uppercase font-black tracking-widest">A Domicilio</span>
            </button>

            <button 
              type="button"
              onClick={() => setDeliveryMethod('retiro')}
              className={`flex flex-col items-center gap-3 p-6 border-2 transition-all ${deliveryMethod === 'retiro' ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
            >
              <Store size={24} strokeWidth={1.5} />
              <span className="text-[9px] uppercase font-black tracking-widest">Retiro Local</span>
            </button>
          </div>

          {deliveryMethod === 'domicilio' ? (
            /* VISTA DOMICILIO: WHATSAPP */
            <div className="bg-gray-50 p-8 border border-gray-100 space-y-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-black italic">Envío a Domicilio</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Para coordinar el envío a tu zona y el pago, comunicate con Jazmín por WhatsApp.
              </p>
              <button 
                onClick={handleWhatsAppContact}
                className="w-full bg-[#25D366] text-white py-6 text-[10px] uppercase font-black tracking-[0.4em] flex items-center justify-center gap-3 shadow-xl shadow-green-100"
              >
                <MessageCircle size={18} fill="white" />
                Contactar a Jazmín
              </button>
            </div>
          ) : (
            /* VISTA RETIRO: FORMULARIO + MERCADO PAGO */
            <form onSubmit={handleSubmitRetiro} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black tracking-widest text-black italic">Nombre Completo</label>
                <input required type="text" className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none text-sm" onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black tracking-widest text-black italic">Email</label>
                  <input required type="email" className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none text-sm" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black tracking-widest text-black italic">Teléfono</label>
                  <input required type="tel" className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none text-sm" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={loading || cart.length === 0} className="w-full bg-black text-white py-6 text-[10px] uppercase font-black tracking-[0.4em] hover:bg-gray-800 transition-colors mt-6">
                {loading ? 'PROCESANDO...' : 'Pagar Retiro Local'}
              </button>
            </form>
          )}
        </div>

        {/* COLUMNA DERECHA: RESUMEN (Igual que antes) */}
        <div className="bg-gray-50 p-10 lg:sticky lg:top-32 h-fit border border-gray-100">
          <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-black mb-8 border-b pb-4">Tu Pedido</h3>
          <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm gap-4">
                <div className="flex gap-4 items-center">
                  <div className="relative h-16 w-16 bg-white flex-shrink-0 border border-gray-100">
                    <img src={item.image} alt={item.name} className="object-cover h-full w-full" />
                  </div>
                  <div>
                    <p className="font-bold uppercase text-[11px] italic">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Cant: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-[11px]">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-black pt-4 flex justify-between items-center">
            <span className="text-[10px] uppercase font-black tracking-[0.3em] italic">Total Final</span>
            <span className="text-3xl font-black italic">${totalProducts.toLocaleString()}</span>
          </div>
        </div>

      </div>
    </div>
  );
}