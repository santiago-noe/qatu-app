import type { Metadata } from "next";
import { AdminPage } from "@/features/protected/admin/components/admin-shell";
import { UserAdmin } from "@/features/protected/admin/components/user-admin";
import { requireAdminAccess } from "@/features/protected/admin/lib/admin-data";

export const metadata: Metadata = { title: "Usuarios · Administración" };

export default async function Page() {
  await requireAdminAccess("/admin/usuarios");
  return (
    <AdminPage
      title="Usuarios"
      description="Busca una cuenta por su correo para asignar roles internos o suspenderla. Cada cambio queda en la auditoría."
    >
      <UserAdmin />
    </AdminPage>
  );
}
