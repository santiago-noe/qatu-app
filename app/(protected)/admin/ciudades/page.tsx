import type { Metadata } from "next";
import { AdminPage } from "@/features/protected/admin/components/admin-shell";
import { CitiesAdmin } from "@/features/protected/admin/components/cities-admin";
import { loadCities } from "@/features/protected/admin/lib/admin-data";

export const metadata: Metadata = { title: "Ciudades · Administración" };

export default async function Page() {
  const cities = await loadCities("/admin/ciudades");
  return (
    <AdminPage
      title="Ciudades"
      description="Encender o apagar una ciudad cambia lo que ve el público al instante. Una ciudad nueva se agrega con los límites oficiales de sus distritos."
    >
      <CitiesAdmin cities={cities} />
    </AdminPage>
  );
}
