import type { Metadata } from "next";
import { AdminPage } from "@/features/protected/admin/components/admin-shell";
import { CategoryAdmin } from "@/features/protected/admin/components/category-admin";
import { loadCategories } from "@/features/protected/admin/lib/admin-data";
import { VERTICAL_TEXT } from "@/features/protected/admin/lib/categories";

export const metadata: Metadata = { title: "Oficios · Administración" };

export default async function Page() {
  const roots = await loadCategories("service", "/admin/oficios");
  return (
    <AdminPage
      title={VERTICAL_TEXT.service.title}
      description="Los oficios que se pueden contratar. Cada uno puede tener especialidades dentro."
    >
      <CategoryAdmin vertical="service" roots={roots} />
    </AdminPage>
  );
}
