'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';

export default function CheckoutPage() {
  const { cart } = useCart();
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Rosario', // Default por zona de influencia
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí es donde conectaremos con la API de Mercado Pago
    alert('Próximo paso: Integrar Mercado Pago');
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div>
          <h2 className="text-[10px] uppercase font-black tracking-[0.4em] text-gray-400 mb-2">Finalizar Compra</h2>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-12 text-black">Tus Datos.</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black tracking-widest text-black">Nombre Completo</label>
              <input 
                required
                type="text" 
                className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none transition-colors text-sm"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black tracking-widest text-black">Email</label>
                <input 
                  required
                  type="email" 
                  className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none transition-colors text-sm"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black tracking-widest text-black">Teléfono</label>
                <input 
                  required
                  type="tel" 
                  className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none transition-colors text-sm"
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black tracking-widest text-black">Dirección de Envío</label>
              <input 
                required
                type="text" 
                className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none transition-colors text-sm"
                placeholder="Calle, número, departamento..."
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-black text-white py-6 text-[10px] uppercase font-black tracking-[0.4em] hover:bg-gray-800 transition-colors mt-10"
            >
              Confirmar y Pagar
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: RESUMEN DEL PEDIDO */}
        <div className="bg-gray-50 p-10 lg:sticky lg:top-32 h-fit">
          <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-black mb-8 border-b pb-4">Resumen</h3>
          
          <div className="space-y-6 mb-8">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex gap-4 items-center">
                  <span className="text-[10px] font-bold text-gray-400">{item.quantity}x</span>
                  <span className="font-bold uppercase text-[11px] tracking-tight">{item.name}</span>
                </div>
                <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 tracking-widest">
              <span>Envío</span>
              <span>A convenir</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-[10px] uppercase font-black tracking-[0.3em]">Total</span>
              <span className="text-3xl font-black">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}