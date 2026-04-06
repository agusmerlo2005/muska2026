'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Tag, Package, LayoutDashboard } from 'lucide-react';

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { name: 'Productos', href: '/admin/products', icon: <Package size={18} /> },
    { name: 'Categorías', href: '/admin/categories', icon: <Tag size={18} /> },
    { name: 'Ventas', href: '/admin/orders', icon: <ShoppingBag size={18} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-7xl mx-auto flex justify-around md:justify-start md:gap-10">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-black scale-110' : 'text-gray-300 hover:text-black'
              }`}
            >
              {link.icon}
              <span className="text-[8px] font-black uppercase tracking-widest">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}