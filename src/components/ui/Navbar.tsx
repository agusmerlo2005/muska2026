'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/features/cart/store';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { items, openCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Evita errores de hidratación (Zustand necesita esto en Next.js)
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Estilo dinámico para los links
  const linkStyle = (path: string) => 
    `transition-all duration-300 hover:text-black tracking-[0.3em] ${
      pathname === path 
        ? 'text-black font-black border-b-2 border-black pb-1' 
        : 'text-gray-400 font-medium'
    }`;

  return (
    <nav className="fixed top-0 z-[100] w-full border-b border-gray-100 bg-white/80 backdrop-blur-md px-6 py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        {/* IZQUIERDA: Navegación Principal */}
        <div className="hidden md:flex items-center gap-10 text-[10px] uppercase">
          <Link href="/" className={linkStyle('/')}>Inicio</Link>
          <Link href="/shop" className={linkStyle('/shop')}>Tienda</Link>
          <Link href="/nosotros" className={linkStyle('/nosotros')}>Nosotros</Link>
        </div>

        {/* CENTRO: Logo Identidad MUSKA */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-black tracking-[-0.05em] text-black leading-none">
            MUSKA
          </span>
          <span className="text-[7px] tracking-[0.5em] uppercase text-gray-400 font-bold mt-1">
            Interiorismo
          </span>
        </Link>

        {/* DERECHA: Carrito y Admin */}
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/products" 
            className="hidden md:block text-[9px] font-bold uppercase tracking-widest text-gray-300 hover:text-black transition-colors"
          >
            Panel
          </Link>

          <button 
            onClick={openCart}
            className="relative p-2 group"
            aria-label="Abrir Carrito"
          >
            <ShoppingBag size={22} strokeWidth={1.2} className="group-hover:scale-110 transition-transform text-black" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white shadow-lg">
                {totalItems}
              </span>
            )}
          </button>

          {/* Menú Hamburguesa (Mobile) */}
          <button 
            className="md:hidden p-2 text-black"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MOBILE */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-10 flex flex-col items-center gap-8 md:hidden animate-in fade-in slide-in-from-top-5 duration-300">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest">Inicio</Link>
          <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest">Tienda</Link>
          <Link href="/nosotros" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest">Nosotros</Link>
          <Link href="/admin/products" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Admin</Link>
        </div>
      )}
    </nav>
  );
}