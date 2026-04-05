'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import { useCart } from '@/hooks/useCart';
import CartDrawer from '@/features/cart/CartDrawer';
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isOpen = useCart((state) => state.isOpen);
  const onClose = useCart((state) => state.onClose);
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="es">
      <body className={`${inter.className} bg-white antialiased`}>
        
        {/* Componente Navbar Centralizado */}
        <Navbar />

        {/* Carrito Lateral */}
        <CartDrawer isOpen={isOpen} onClose={onClose} />

        {/* IMPORTANTE: pt-[120px] asegura que el contenido NO quede 
            escondido detrás del Navbar fijo al cargar la página.
        */}
        <main className="pt-[100px] md:pt-[120px]">
          {children}
        </main>
      </body>
    </html>
  );
}