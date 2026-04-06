// 1. Importamos tu propio creador de cliente (el que usa @supabase/ssr)
import { createClient } from '@/lib/supabase/server'; 
import Link from 'next/link';
import { 
  ShoppingBag, 
  Package, 
  Tag, 
  ArrowUpRight, 
  TrendingUp, 
  Users 
} from 'lucide-react';

export default async function AdminDashboardPage() {
  // 2. Usamos tu función configurada
  const supabase = await createClient();

  // Traemos datos rápidos para las estadísticas
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: categoriesCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  const stats = [
    { 
      label: 'Productos Totales', 
      value: productsCount || 0, 
      icon: Package, 
      href: '/admin/products',
      color: 'bg-black text-white' 
    },
    { 
      label: 'Categorías', 
      value: categoriesCount || 0, 
      icon: Tag, 
      href: '/admin/categories',
      color: 'bg-gray-100 text-black' 
    },
    { 
      label: 'Ventas (Demo)', 
      value: '0', 
      icon: ShoppingBag, 
      href: '#', 
      color: 'bg-gray-100 text-black' 
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-white text-black">
      {/* HEADER */}
      <header className="mb-12">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic">
          PANEL DE CONTROL.
        </h1>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.5em] mt-2">
          Gestión Centralizada — Muska Home & Deco
        </p>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat) => (
          <Link 
            key={stat.label} 
            href={stat.href}
            className="group border border-gray-100 p-8 transition-all hover:border-black flex flex-col justify-between h-48"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <ArrowUpRight size={18} className="text-gray-300 group-hover:text-black transition-colors" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">
                {stat.label}
              </p>
              <p className="text-4xl font-black tracking-tighter">
                {stat.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="border border-gray-100 p-8">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <TrendingUp size={14} /> Acciones Rápidas
          </h2>
          <div className="space-y-4">
            <Link 
              href="/admin/products" 
              className="block w-full text-center border border-black py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all"
            >
              Cargar Nuevo Producto
            </Link>
            <Link 
              href="/admin/categories" 
              className="block w-full text-center border border-gray-200 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:border-black transition-all text-gray-400 hover:text-black"
            >
              Administrar Categorías
            </Link>
          </div>
        </section>

        <section className="border border-gray-100 p-8 flex flex-col justify-center items-center text-center">
          <Users size={30} className="text-gray-200 mb-4" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sesión Activa</h3>
          <p className="text-[12px] font-bold mt-1">ADMINISTRADOR MUSKA</p>
          <div className="mt-6 h-1 w-12 bg-black" />
        </section>
      </div>
    </div>
  );
}