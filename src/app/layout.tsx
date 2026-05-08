import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import Footer from "@/components/ui/Footer"; // ✅ Importamos tu Footer

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // ✅ Se agrega metadataBase para resolver las rutas de las imágenes sociales
  metadataBase: new URL('https://muska2026.vercel.app'),
  title: "MUSKA. | Store & Admin",
  description: "Handmade Candles & Decor",
  openGraph: {
    title: "MUSKA. | Store & Admin",
    description: "Handmade Candles & Decor",
    url: "https://muska2026.vercel.app",
    siteName: "Muska Home",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Muska Home & Deco",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MUSKA. | Store & Admin",
    description: "Handmade Candles & Decor",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-white antialiased`}>
        <ClientLayout>
          {/* Usamos una estructura mínima para que el contenido 
              empuje al footer hacia abajo 
          */}
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              {children}
            </main>
            <Footer /> {/* ✅ Tu publicidad personal conectada aquí */}
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}