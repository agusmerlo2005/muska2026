import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <div className={`flex flex-col items-center group transition-opacity hover:opacity-80 ${className}`}>
      {/* Texto Principal */}
      <h1 className="text-2xl md:text-3xl font-black tracking-[-0.05em] text-gray-800 leading-none uppercase">
        Muska
      </h1>
      
      {/* Subtítulo con borde - Ajustado para que no rompa el centrado */}
      <div className="mt-1 border-t border-gray-200 pt-1 flex justify-center w-full max-w-fit">
        <p className="text-[8px] md:text-[9px] uppercase tracking-[0.5em] font-bold text-gray-400 leading-none whitespace-nowrap">
          home & deco
        </p>
      </div>
    </div>
  );
}