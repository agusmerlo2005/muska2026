'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Clipboard, Check } from 'lucide-react';
import { motion } from 'framer-motion';

// Componente interno para manejar los parámetros de búsqueda de forma segura en Next.js
function SuccessContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Capturamos el ID que viene de Mercado Pago o de tu redirección interna
    const id = searchParams.get('external_reference') || searchParams.get('payment_id');
    setOrderId(id);
  }, [searchParams]);

  const copyToClipboard = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md w-full"
    >
      <div className="flex justify-center mb-8">
        <CheckCircle2 size={60} strokeWidth={1} className="text-black" />
      </div>
      
      <h2 className="text-[10px] uppercase font-black tracking-[0.5em] text-gray-400 mb-4">
        Pago Confirmado
      </h2>
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 text-black leading-none italic">
        ¡Gracias por tu compra!
      </h1>
      
      <p className="text-sm text-gray-500 leading-relaxed mb-10">
        Tu pedido ha sido procesado con éxito. Guardá tu ID para consultar el estado de envío en tiempo real.
      </p>

      {/* BOX DE ID DE SEGUIMIENTO */}
      <div className="bg-gray-50 border border-gray-100 p-6 mb-10 group relative overflow-hidden">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-3">
          ID de Seguimiento
        </p>
        <div className="flex items-center justify-center gap-4">
          <code className="text-base font-black tracking-tight text-black">
            {orderId || 'PROCESANDO...'}
          </code>
          <button 
            onClick={copyToClipboard}
            className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200 active:scale-90"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Clipboard size={16} className="text-gray-400" />}
          </button>
        </div>
        {copied && (
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-green-500 uppercase tracking-widest"
          >
            Copiado al portapapeles
          </motion.span>
        )}
      </div>

      <div className="space-y-4">
        <Link 
          href={`/seguimiento?id=${orderId}`}
          className="w-full flex items-center justify-center gap-3 bg-black text-white py-5 text-[10px] uppercase font-black tracking-[0.3em] transition-all hover:bg-gray-900 shadow-xl shadow-gray-100"
        >
          <Package size={16} />
          Seguir mi pedido
        </Link>
        
        <Link 
          href="/"
          className="w-full block border border-gray-100 text-gray-400 py-5 text-[10px] uppercase font-black tracking-[0.3em] transition-all hover:border-black hover:text-black"
        >
          Volver al Inicio
        </Link>
        
        <p className="text-[9px] uppercase font-bold text-gray-300 tracking-widest pt-4">
          MUSKA — EST. 2026
        </p>
      </div>
    </motion.div>
  );
}

// Exportación principal con Suspense (necesario en Next.js al usar useSearchParams)
export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <Suspense fallback={<p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Cargando confirmación...</p>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}