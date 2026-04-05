import Image from 'next/image';

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="mx-auto max-w-5xl">
        
        {/* Encabezado Principal */}
        <header className="mb-24 relative">
          <span className="text-[10px] uppercase tracking-[0.6em] text-gray-400 font-bold block mb-4 relative z-10">
            Est. 2025 — Rosario, Argentina
          </span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-black relative z-10">
            Qué es <br /> Muska?.
          </h1>
        </header>

        {/* Sección de Historia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start mb-24">
          
          <div className="space-y-10">
            <div className="space-y-6 text-lg leading-relaxed tracking-tight text-black/80">
              <p>
                MUSKA nació en 2025 como un puente entre la calma de Armstrong y la vibrante energía creativa de Rosario. 
                Creada por Jazmín De Grande, la marca es el resultado de una búsqueda personal por democratizar el buen diseño en los objetos cotidianos.
              </p>
              <p>
                Como estudiante de Diseño de Interiores, Jazmín fusiona su formación técnica con una pasión innata por el bazar y la estética funcional. 
                Cada pieza en nuestra tienda no es elegida al azar; es seleccionada bajo la premisa de que lo que usamos todos los días —desde una taza hasta un estante— define la atmósfera de nuestro hogar.
              </p>
            </div>

            {/* Manifiesto Personal */}
            <div className="bg-gray-50 p-8 border-l-4 border-black">
              <p className="text-sm italic text-gray-600 leading-relaxed">
                "Creo que los espacios que habitamos cuentan nuestra historia. Mi misión con Muska es ayudar a que esa historia sea bella, funcional y llena de detalles que inspiren."
              </p>
              <p className="mt-4 text-[10px] uppercase tracking-widest font-bold text-black">
                — Jazmín De Grande, owner de Muska
              </p>
            </div>
          </div>

          {/* FOTO 1: Retrato de Estética (Showroom curvo) */}
          <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl rounded-sm">
            <Image 
              src="/images/image_2.jpg" 
              alt="Showroom Muska" 
              fill 
              className="object-cover" 
              priority
            />
          </div>
        </div>

        {/* Grilla de Detalles y Materiales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          
          {/* FOTO 2: Detalles de Bazar (Cubiertos) */}
          <div className="relative aspect-square md:aspect-[3/4] bg-gray-50 overflow-hidden rounded-sm group">
            <Image 
              src="/images/image_4.jpg" 
              alt="Bazar de autor" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute bottom-4 left-4 text-[9px] uppercase tracking-widest text-black bg-white/80 px-2 py-1 backdrop-blur-sm">
              Experiencia de visita
            </div>
          </div>

          {/* Texto Central */}
          <div className="text-center pb-12 space-y-4 px-4 order-first md:order-none">
            <h3 className="text-xs uppercase tracking-[0.4em] font-black text-black">La Curaduría</h3>
            <p className="text-sm text-gray-500 leading-relaxed tracking-wide">
              Seleccionamos materiales nobles y objetos que equilibran la técnica del diseño de interiores con la calidez del hogar.
            </p>
          </div>

          {/* FOTO 3: Materiales */}
          <div className="relative aspect-square md:aspect-[3/4] bg-gray-50 overflow-hidden rounded-sm group">
            <Image 
              src="/images/image_3.jpg" 
              alt="Texturas y Materiales" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute bottom-4 right-4 text-[9px] uppercase tracking-widest text-white bg-black/80 px-2 py-1 backdrop-blur-sm">
              Texturas y Materiales
            </div>
          </div>
        </div>

        {/* Footer de Sección */}
        <div className="mt-32 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black mb-4 text-black">Objetivo de Muska</h4>
            <p className="max-w-xs text-xs text-gray-400 leading-relaxed uppercase tracking-wider">
              Objetos pensados para durar, diseñados para ser vistos y creados para ser usados.
            </p>
          </div>
          <div className="text-right">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black mb-4 text-black">Ubicación</h4>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Armstrong y Rosario — Santa Fe <br />
              Argentina
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}