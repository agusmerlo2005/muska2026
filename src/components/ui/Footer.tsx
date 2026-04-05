import Link from 'next/link';
import { Instagram, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          {/* Columna 1: Identidad */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <h2 className="text-3xl font-black tracking-tighter uppercase">MUSKA</h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm uppercase tracking-widest">
              Curaduría de objetos y bazar. Una extensión del diseño de interiores hacia lo cotidiano. 
              Desde Armstrong para Rosario.
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-black tracking-[0.4em] text-black">Explorar</h4>
            <ul className="space-y-2 text-[11px] uppercase tracking-widest text-gray-400 font-bold">
              <li><Link href="/shop" className="hover:text-black transition-colors">Tienda</Link></li>
              <li><Link href="/nosotros" className="hover:text-black transition-colors">Nosotros</Link></li>
              <li><Link href="/admin" className="hover:text-black transition-colors text-gray-200">Acceso</Link></li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-black tracking-[0.4em] text-black">Contacto</h4>
            <div className="space-y-2 text-[11px] uppercase tracking-widest text-gray-400 font-bold">
              <p>Rosario, Santa Fe</p>
              <a href="https://wa.me/3471592559" target="_blank" className="block hover:text-black transition-colors">
                +54 3471 592559
              </a>
              <a href="https://instagram.com" target="_blank" className="flex items-center gap-2 hover:text-black transition-colors">
                <Instagram size={12} /> @muska.deco
              </a>
            </div>
          </div>
        </div>

        {/* Créditos Finales */}
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[8px] uppercase tracking-[0.5em] text-gray-300">
            © 2026 Muska — Todos los derechos reservados.
          </p>
          <p className="text-[8px] uppercase tracking-[0.5em] text-gray-300">
            Diseño de Interiores & Curaduría
          </p>
        </div>
      </div>
    </footer>
  );
}