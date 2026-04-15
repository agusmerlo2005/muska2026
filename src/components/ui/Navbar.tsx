'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import Logo from './Logo';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const openCart = useCart((state) => state.openCart);
  const cartCount = useCart((state) => state.cart.reduce((acc, item) => acc + item.quantity, 0));

  // 1. Manejo del scroll de la página (para el estilo de la Navbar)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. BLOQUEO DE SCROLL EN MÓVIL
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Seguimiento', href: '/seguimiento' }, // ✅ Link agregado
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative h-full">
        
        {/* BOTÓN MENÚ MOBILE */}
        <button className="md:hidden p-2 -ml-2" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={20} />
        </button>

        {/* LINKS IZQUIERDA (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className="text-[10px] uppercase font-black tracking-[0.3em] hover:opacity-50 transition-opacity italic"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* LOGO CENTRAL */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/">
            <Logo className="w-24 md:w-32" />
          </Link>
        </div>

        {/* BOTÓN CARRITO (Derecha) */}
        <button 
          onClick={openCart} 
          className="relative p-2 -mr-2 flex items-center gap-2 group"
        >
          <span className="hidden md:block text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity italic">
            Carrito
          </span>
          <div className="relative">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-sans">
                {cartCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* MENÚ DESPLEGABLE MOBILE */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: '-100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[200] flex flex-col p-6 md:hidden overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <Logo className="w-20" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-10">
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-4xl font-black uppercase italic tracking-tighter text-black"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="pb-10 text-center">
               <p className="text-[8px] uppercase tracking-[0.4em] font-bold text-gray-300">
                 Muska home & deco — 2026
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}