import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/session";
import { PANEL_ACTION, PANEL_LABEL, PanelHeader } from "@/features/protected/shared/components/panel-header";
import { AdminNav } from "./admin-nav";

// Marco del panel admin: cabecera, pestañas de secciones y el contenido de cada página.
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-soft">
      <PanelHeader>
        <Button asChild variant="outline" className={PANEL_ACTION}>
          <Link href={ROUTES.dashboard}>
            <LayoutDashboard strokeWidth={1.5} aria-hidden />
            <span className={PANEL_LABEL}>Mi panel</span>
          </Link>
        </Button>
      </PanelHeader>
      <main>
        <Container size="wide" className="py-8 sm:py-10">
          <p className="eyebrow">Administración</p>
          <div className="mt-3">
            <AdminNav />
          </div>
          <div className="mt-6">{children}</div>
        </Container>
      </main>
    </div>
  );
}

interface AdminPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

// Encabezado de cada sección (un solo h1 por página).
export function AdminPage({ title, description, children }: AdminPageProps) {
  return (
    <section aria-labelledby="admin-titulo">
      <h1 id="admin-titulo" className="text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="mt-1.5 max-w-2xl text-ink-2">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
