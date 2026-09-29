import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/session";
import { LogoutButton } from "@/features/auth/shared/components/logout-button";
import { AdminNav } from "./admin-nav";

// Contenido de la barra lateral: logo, secciones y, al pie, volver al panel o cerrar sesión.
// La usan la barra fija de escritorio y el menú del celular.
export function AdminSidebarContent() {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-2 pt-1">
        <Logo height={34} />
        <p className="mt-2 text-xs font-medium text-ink-3">Panel de administración</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AdminNav />
      </div>
      <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-bg-soft p-3">
        <Button asChild variant="outline" className="h-10 justify-start rounded-[var(--radius-control)] bg-bg">
          <Link href={ROUTES.dashboard}>
            <LayoutDashboard strokeWidth={1.5} aria-hidden />
            Mi panel
          </Link>
        </Button>
        <LogoutButton className="h-10 justify-start rounded-[var(--radius-control)]" />
      </div>
    </div>
  );
}
