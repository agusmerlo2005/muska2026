'use client';

import Link from 'next/link';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="flex justify-center mb-8">
          <CheckCircle2 size={60} strokeWidth={1} className="text-black" />
        </div>
        
        <h2 className="text-[10px] uppercase font-black tracking-[0.5em] text-gray-400 mb-4">
          Pago Confirmado
        </h2>
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 text-black leading-none">
          ¡Gracias por tu compra!
        </h1>
        
        <p className="text-sm text-gray-500 leading-relaxed mb-12">
          Tu pedido ha sido procesado con éxito. En breve recibirás un correo con el detalle y nos pondremos en contacto para coordinar el envío.
        </p>

        <div className="space-y-4">
          <Link 
            href="/"
            className="w-full block bg-black text-white py-5 text-[10px] uppercase font-black tracking-[0.3em] transition-all hover:bg-gray-900"
          >
            Volver al Inicio
          </Link>
          
          <p className="text-[9px] uppercase font-bold text-gray-300 tracking-widest pt-4">
            MUSKA — EST. 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}