'use client';

import Link from 'next/link';
import { Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#1A1A1A] text-white py-6 px-6 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Izquierda: Copyright y ubicación Muska */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <p className="text-[10px] uppercase tracking-[0.3em] font-black">
            MUSKA Home & Deco
          </p>
          <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400">
            © Created 2025
          </span>
        </div>

        {/* Derecha: Publicidad Personal con tu estilo */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right gap-1">
          <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400">
            Desarrollado y Diseñado por
          </p>
          
          <Link 
            href="https://www.instagram.com/digitall_forge?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
            target="_blank" 
            className="group flex flex-col items-center md:items-end"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-white">
                Agustín Merlo
              </h3>
              <Instagram size={14} className="text-gray-400 group-hover:text-white transition-colors" />
            </div>
            
            <span className="text-[9px] uppercase tracking-[0.4em] text-gray-500 group-hover:text-white transition-colors">
              @digitall_forge
            </span>
          </Link>
        </div>

      </div>
    </footer>
  );
}