'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { onOpen, cart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link href={href} className="relative group py-2">
        <span className={`text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
          isActive ? 'text-black font-bold' : 'text-gray-400 group-hover:text-black'
        }`}>
          {children}
        </span>
        <span className={`absolute bottom-0 left-0 h-[1.5px] bg-black transition-all duration-300 ${
          isActive ? 'w-full' : 'w-0 group-hover:w-full'
        }`} />
      </Link>
    );
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      /* Clases de blindaje: 
         - bg-white: 100% opaco para tapar el texto de atrás.
         - z-[100]: Máxima prioridad de capa.
         - border-b: Separación sutil.
      */
      className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-gray-100 bg-white px-6 py-6"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        
        {/* IZQUIERDA */}
        <div className="hidden lg:flex items-center gap-8 flex-1">
          <NavLink href="/">Inicio</NavLink>
          <NavLink href="/shop">Tienda</NavLink>
          <NavLink href="/nosotros">Nosotros</NavLink>
        </div>

        {/* CENTRO */}
        <div className="flex-none">
          <Link href="/" className="flex flex-col items-center group transition-transform duration-300 hover:scale-105">
            <span className="text-2xl md:text-3xl font-black tracking-[-0.05em] text-black leading-none uppercase">
              MUSKA
            </span>
            <span className="text-[7px] tracking-[0.4em] uppercase text-gray-400 font-bold mt-1">
              Interiorismo
            </span>
          </Link>
        </div>

        {/* DERECHA */}
        <div className="flex-1 flex items-center justify-end gap-5">
          <Link 
            href="/admin" 
            className="hidden sm:block text-[9px] font-bold uppercase tracking-widest text-gray-300 hover:text-black transition-all"
          >
            Panel
          </Link>

          <button 
            onClick={onOpen} 
            className="relative p-2 transition-transform hover:scale-110 active:scale-95"
          >
            <ShoppingBag size={22} strokeWidth={1.2} className="text-black" />
            <AnimatePresence>
              {mounted && totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button 
            className="lg:hidden p-2 text-black"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden lg:hidden flex flex-col items-center gap-6 py-8 bg-white"
          >
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest">Inicio</Link>
            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest">Tienda</Link>
            <Link href="/nosotros" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest">Nosotros</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}