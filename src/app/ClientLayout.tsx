'use client';

import { usePathname } from "next/navigation";
import Navbar from "../components/ui/Navbar"; 
import CartDrawer from "../features/cart/CartDrawer"; 

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminPage && (
        <>
          <Navbar />
          <CartDrawer /> 
        </>
      )}
      <main className={!isAdminPage ? "relative pt-20" : "relative"}>
        {children}
      </main>
    </>
  );
}