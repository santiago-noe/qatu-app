import type { StaffRole } from "@/features/protected/admin/lib/admin-nav";
import { AdminSidebarContent } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

// Marco del panel admin: barra lateral fija (escritorio) o menú (celular), barra superior y contenido.
export function AdminShell({ name, roles, children }: { name: string; roles: StaffRole[]; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-soft lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-bg lg:block">
        <AdminSidebarContent roles={roles} />
      </aside>
      <div className="min-w-0">
        <AdminTopbar name={name} roles={roles} menu={<AdminSidebarContent roles={roles} />} />
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

interface AdminPageProps {
  title: string;
  description: string;
  /** Acción principal a la derecha del título ("Nueva categoría"). */
  action?: React.ReactNode;
  children: React.ReactNode;
}

// Encabezado de cada sección (un solo h1 por página).
export function AdminPage({ title, description, action, children }: AdminPageProps) {
  return (
    <section aria-labelledby="admin-titulo">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 id="admin-titulo" className="text-2xl font-semibold tracking-tight sm:text-[28px]">
            {title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-ink-2">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
