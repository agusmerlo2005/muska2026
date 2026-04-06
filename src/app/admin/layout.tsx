import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black antialiased">
      {/* NAVBAR: Fino y elegante, se adapta al ancho */}
      <nav className="border-b border-gray-50 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link href="/admin" className="shrink-0 group">
               <h2 className="text-xs font-bold italic tracking-tighter uppercase">Muska.</h2>
            </Link>

            {/* Separador sutil */}
            <div className="h-3 w-[1px] bg-gray-200" />

            <div className="flex gap-4">
              <Link 
                href="/admin/products" 
                className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 hover:text-black transition-colors"
              >
                Stock
              </Link>
              <Link 
                href="/admin/categories" 
                className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 hover:text-black transition-colors"
              >
                Categorías
              </Link>
            </div>
          </div>

          <Link 
            href="/" 
            className="text-[8px] font-bold uppercase tracking-widest text-gray-300 hover:text-black transition-colors"
          >
            Salir
          </Link>
        </div>
      </nav>

      {/* CONTENIDO: Con padding responsivo */}
      <main className="px-6 py-10 md:px-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}