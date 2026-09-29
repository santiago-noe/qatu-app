import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { AdminPage } from "@/features/protected/admin/components/admin-shell";
import { SettingsAdmin } from "@/features/protected/admin/components/settings-admin";
import { loadCategories, loadCities, loadSettings } from "@/features/protected/admin/lib/admin-data";

export const metadata: Metadata = { title: "Comisiones · Administración" };

const PATH = "/admin/comisiones";

export default async function Page() {
  const [settings, cities, rental, service, me] = await Promise.all([
    loadSettings(PATH),
    loadCities(PATH),
    loadCategories("rental", PATH),
    loadCategories("service", PATH),
    getCurrentUser(PATH),
  ]);
  return (
    <AdminPage
      title="Comisiones y tarifas"
      description="Valores de piloto. Uno general y, si hace falta, otros por ciudad o categoría: gana el más específico. Un cambio solo afecta a las transacciones nuevas."
    >
      <SettingsAdmin settings={settings} cities={cities} categories={{ rental, service }} meId={me.id} />
    </AdminPage>
  );
}
