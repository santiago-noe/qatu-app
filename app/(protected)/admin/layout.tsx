import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { ROUTES } from "@/lib/session";
import { AdminShell } from "@/features/protected/admin/components/admin-shell";
import { staffRoles } from "@/features/protected/admin/lib/admin-nav";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Personal interno: administradores (todo) y moderadores (solo la moderación). qatu-api vuelve a
// exigir el rol y el segundo paso en cada petición: esto solo evita mostrar un panel vacío.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentUser(ROUTES.admin);
  const roles = staffRoles(user.roles);
  if (roles.length === 0) redirect(ROUTES.unauthorized);
  return (
    <AdminShell name={user.name} roles={roles}>
      {children}
    </AdminShell>
  );
}
