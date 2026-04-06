'use client';

import Link from 'next/link';
import { XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="flex justify-center mb-8 text-red-500">
          <XCircle size={60} strokeWidth={1} />
        </div>
        
        <h2 className="text-[10px] uppercase font-black tracking-[0.5em] text-red-500 mb-4">
          Ups, algo salió mal
        </h2>
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 text-black leading-none">
          Pago no procesado.
        </h1>
        
        <p className="text-sm text-gray-500 leading-relaxed mb-12">
          No pudimos completar la transacción. Puede deberse a un problema con la tarjeta o falta de fondos. No te preocupes, tu carrito sigue guardado.
        </p>

        <div className="space-y-4">
          <Link 
            href="/checkout"
            className="w-full block bg-black text-white py-5 text-[10px] uppercase font-black tracking-[0.3em] transition-all hover:bg-gray-900"
          >
            Reintentar Pago
          </Link>
          
          <Link 
            href="/"
            className="text-[9px] uppercase font-bold text-gray-300 hover:text-black transition-colors block py-2 tracking-widest"
          >
            Volver a la tienda
          </Link>
        </div>
      </motion.div>
    </div>
  );
}