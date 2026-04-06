import React from 'react';

// Definimos que el Logo puede recibir una clase de CSS opcional
interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    /* Agregamos {className} al div principal para que tome el tamaño del Navbar */
    <div className={`flex flex-col items-center group transition-opacity hover:opacity-80 ${className}`}>
      {/* Texto Principal en Gris Oscuro/Piedra */}
      <h1 className="text-2xl md:text-3xl font-black tracking-[-0.05em] text-gray-800 leading-none uppercase">
        Muska
      </h1>
      
      {/* Subtítulo Delicado en Gris Claro */}
      <div className="mt-1 border-t border-gray-200 pt-1 w-full flex justify-center">
        <p className="text-[8px] md:text-[9px] uppercase tracking-[0.5em] font-bold text-gray-400 leading-none">
          home & deco
        </p>
      </div>
    </div>
  );
}