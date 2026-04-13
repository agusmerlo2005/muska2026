import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MUSKA. | Store & Admin",
  description: "Handmade Candles & Decor",
  // ✅ Agregado para previsualización en redes (WhatsApp, IG, etc.)
  openGraph: {
    title: "MUSKA. | Store & Admin",
    description: "Handmade Candles & Decor",
    url: "https://muska2026.vercel.app",
    siteName: "Muska Home",
    images: [
      {
        url: "/og-image.jpg", // Asegurate de poner una imagen con este nombre en tu carpeta /public
        width: 1200,
        height: 630,
        alt: "Muska Home & Deco",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  // ✅ Agregado para compatibilidad con Twitter/X
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
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}