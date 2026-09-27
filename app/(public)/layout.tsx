import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {/* Cabecera fija (64 px) + barra de aviso (32 px) */}
      <main className="pt-24">{children}</main>
      <SiteFooter />
    </>
  );
}
