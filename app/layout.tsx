import type { Metadata, Viewport } from "next";
import { Anek_Bangla, Source_Sans_3 } from "next/font/google";
import { sitio } from "@/lib/site";
import "./globals.css";

/* Tipografías de marca (variables, se autoalojan desde Vercel). */
const anekBangla = Anek_Bangla({
  subsets: ["latin"],
  variable: "--font-anek-bangla",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(sitio.url),
  title: {
    default: "PG Asesorías | Servicios automotrices y venta de vehículos en Santiago",
    template: `%s | ${sitio.nombre}`,
  },
  description: sitio.descripcion,
  applicationName: sitio.nombre,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: sitio.url,
    siteName: sitio.nombre,
    title: "PG Asesorías | Servicios automotrices en Santiago",
    description: sitio.descripcion,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${anekBangla.variable} ${sourceSans.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
