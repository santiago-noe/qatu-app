import type { Metadata } from "next";
import { AdminPage } from "@/features/protected/admin/components/admin-shell";
import { CategoryAdmin } from "@/features/protected/admin/components/category-admin";
import { loadCategories } from "@/features/protected/admin/lib/admin-data";
import { VERTICAL_TEXT } from "@/features/protected/admin/lib/categories";

export const metadata: Metadata = { title: "Categorías · Administración" };

export default async function Page() {
  const roots = await loadCategories("rental", "/admin/categorias");
  return (
    <AdminPage
      title={VERTICAL_TEXT.rental.title}
      description="Dos niveles: categoría y tipo. El nivel de riesgo define la verificación mínima para alquilar; las prohibidas no se pueden publicar."
    >
      <CategoryAdmin vertical="rental" roots={roots} />
    </AdminPage>
  );
}
