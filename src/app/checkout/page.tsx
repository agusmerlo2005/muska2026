'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Truck, MapPin, Store } from 'lucide-react'; 

const SHIPPING_RATES: { [key: string]: number } = {
  'Santa Fe': 0,
  'CABA': 5500,
  'GBA': 5800,
  'Córdoba': 5200,
  'Resto del País': 7500,
};

export default function CheckoutPage() {
  const { cart } = useCart();
  const totalProducts = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const [loading, setLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState('domicilio'); 
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    deliveryNotes: '', 
  });

  const finalTotal = totalProducts + (deliveryMethod === 'retiro' ? 0 : shippingCost);

  const handleProvinceChange = (province: string) => {
    const cost = SHIPPING_RATES[province] || SHIPPING_RATES['Resto del País'];
    setShippingCost(cost);
    setFormData({ ...formData, province });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.province && deliveryMethod !== 'retiro') {
      alert("Por favor seleccioná una provincia.");
      return;
    }
    setLoading(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cart, 
          formData, 
          total: finalTotal,
          shippingCost 
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
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div>
          <h2 className="text-[10px] uppercase font-black tracking-[0.4em] text-gray-400 mb-2">Finalizar Compra</h2>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-12 text-black">Entrega y Datos.</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <button 
                type="button"
                onClick={() => setDeliveryMethod('domicilio')}
                className={`flex flex-col items-center gap-3 p-4 border-2 transition-all ${deliveryMethod === 'domicilio' ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400'}`}
              >
                <Truck size={20} strokeWidth={1.5} />
                <span className="text-[8px] uppercase font-black tracking-widest text-center">A Domicilio</span>
              </button>
              <button 
                type="button"
                onClick={() => setDeliveryMethod('sucursal')}
                className={`flex flex-col items-center gap-3 p-4 border-2 transition-all ${deliveryMethod === 'sucursal' ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400'}`}
              >
                <MapPin size={20} strokeWidth={1.5} />
                <span className="text-[8px] uppercase font-black tracking-widest text-center">Sucursal Correo</span>
              </button>
              <button 
                type="button"
                onClick={() => setDeliveryMethod('retiro')}
                className={`flex flex-col items-center gap-3 p-4 border-2 transition-all ${deliveryMethod === 'retiro' ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400'}`}
              >
                <Store size={20} strokeWidth={1.5} />
                <span className="text-[8px] uppercase font-black tracking-widest text-center">Retiro Local</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black tracking-widest text-black">Nombre Completo</label>
                <input required type="text" className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none text-sm" onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black tracking-widest text-black">Email</label>
                  <input required type="email" className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none text-sm" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black tracking-widest text-black">Teléfono</label>
                  <input required type="tel" className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none text-sm" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              {deliveryMethod !== 'retiro' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black tracking-widest text-black">Provincia</label>
                      <select required className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none text-sm bg-white" onChange={(e) => handleProvinceChange(e.target.value)}>
                        <option value="">Seleccionar</option>
                        {Object.keys(SHIPPING_RATES).map(prov => <option key={prov} value={prov}>{prov}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black tracking-widest text-black">Ciudad</label>
                      <input required type="text" className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none text-sm" onChange={(e) => setFormData({...formData, city: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black tracking-widest text-black">
                      {deliveryMethod === 'domicilio' ? 'Dirección Exacta' : 'Sucursal de preferencia (Opcional)'}
                    </label>
                    <input 
                      required={deliveryMethod === 'domicilio'}
                      type="text" 
                      placeholder={deliveryMethod === 'domicilio' ? "Calle 123, Piso 1, Depto A" : "Ej: Sucursal Correo Argentino Centro"}
                      className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none text-sm" 
                      onChange={(e) => setFormData({...formData, address: e.target.value})} 
                    />
                  </div>
                </>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-black text-white py-6 text-[10px] uppercase font-black tracking-[0.4em] hover:bg-gray-800 transition-colors mt-10">
              {loading ? 'PROCESANDO...' : 'Confirmar y Pagar'}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: RESUMEN CON IMÁGENES */}
        <div className="bg-gray-50 p-10 lg:sticky lg:top-32 h-fit">
          <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-black mb-8 border-b pb-4">Resumen</h3>
          
          {/* LISTA DE PRODUCTOS RESTAURADA */}
          <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm gap-4">
                <div className="flex gap-4 items-center">
                  <div className="relative h-16 w-16 bg-white flex-shrink-0 border border-gray-100">
                    <img src={item.image} alt={item.name} className="object-cover h-full w-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold uppercase text-[11px] tracking-tight leading-tight">{item.name}</span>
                    <span className="text-[10px] font-bold text-gray-400 mt-1">Cantidad: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-[11px]">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4 text-sm font-medium">
             <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                <span>Método</span>
                <span className="text-black uppercase">{deliveryMethod}</span>
             </div>
             <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                <span>Envío</span>
                <span>{deliveryMethod === 'retiro' ? 'Sin cargo' : `$${shippingCost.toLocaleString()}`}</span>
             </div>
             <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-[10px] uppercase font-black tracking-[0.3em]">Total</span>
                <span className="text-3xl font-black">${finalTotal.toLocaleString()}</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}