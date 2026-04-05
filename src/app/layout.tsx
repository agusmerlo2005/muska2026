'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import Logo from "@/components/ui/Logo";
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import CartDrawer from '@/features/cart/CartDrawer';
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Usamos el hook de forma desestructurada
  const cart = useCart((state) => state.cart);
  const isOpen = useCart((state) => state.isOpen);
  const onOpen = useCart((state) => state.onOpen);
  const onClose = useCart((state) => state.onClose);
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <html lang="es">
      <body className={`${inter.className} bg-white antialiased`}>
        
        <header className="fixed top-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-sm z-[100] border-b border-gray-50 px-6">
          <div className="mx-auto max-w-7xl h-full grid grid-cols-3 items-center">
            
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-[10px] uppercase font-bold tracking-[0.2em] text-black">Inicio</Link>
              <Link href="/shop" className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 hover:text-black transition-colors">Tienda</Link>
              <Link href="/nosotros" className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 hover:text-black transition-colors">Nosotros</Link>
            </nav>
            
            <div className="flex justify-center scale-90">
              <Link href="/"><Logo /></Link>
            </div>
            
            <div className="flex items-center justify-end gap-6">
              <Link href="/admin" className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-200 hover:text-black">Panel</Link>
              
              <button 
                onClick={onOpen}
                className="text-black hover:scale-110 transition-transform relative p-2"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {mounted && totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-black text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Pasamos las funciones al Drawer */}
        <CartDrawer isOpen={isOpen} onClose={onClose} />

        <main>{children}</main>
      </body>
    </html>
  );
}