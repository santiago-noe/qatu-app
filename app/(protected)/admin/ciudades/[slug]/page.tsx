import type { Metadata } from "next";
import { AdminPage } from "@/features/protected/admin/components/admin-shell";
import { CityDetail } from "@/features/protected/admin/components/city-detail";
import { loadCityZones } from "@/features/protected/admin/lib/admin-data";

export const metadata: Metadata = { title: "Distritos · Administración" };

export default async function Page({ params }: PageProps<"/admin/ciudades/[slug]">) {
  const { slug } = await params;
  const { city, zones } = await loadCityZones(slug, `/admin/ciudades/${slug}`);
  return (
    <AdminPage
      title={`Distritos de ${city.name}`}
      description="Cada distrito con su límite oficial: así la app detecta la zona de cada persona. Una ciudad nueva se enciende cuando ya tiene distritos."
    >
      <CityDetail city={city} zones={zones} />
    </AdminPage>
  );
}
