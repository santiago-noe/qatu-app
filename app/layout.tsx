import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Qatu — Alquila herramientas y contrata técnicos en Ayacucho",
    template: "%s | Qatu",
  },
  description:
    "El lugar de Ayacucho para alquilar la herramienta que necesitas y contratar al técnico que te la resuelve. Piloto en Huamanga.",
  openGraph: {
    title: "Qatu — Herramientas y oficios en Ayacucho",
    description:
      "Alquila herramientas y contrata técnicos de confianza en Huamanga.",
    locale: "es_PE",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#9f3c16",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-PE" className={jakarta.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
