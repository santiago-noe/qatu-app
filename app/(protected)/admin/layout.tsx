import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { ROUTES } from "@/lib/session";
import { AdminShell } from "@/features/protected/admin/components/admin-shell";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Solo administradores. qatu-api vuelve a exigir el rol y el segundo paso en cada petición:
// esta comprobación solo evita mostrar un panel vacío.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentUser(ROUTES.admin);
  if (!user.roles.includes("admin")) redirect(ROUTES.unauthorized);
  return <AdminShell>{children}</AdminShell>;
}
