import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
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
  themeColor: "#ffb703",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-PE" className={poppins.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
