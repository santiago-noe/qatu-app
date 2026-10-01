import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { AdminOverview } from "@/features/protected/admin/components/admin-overview";
import { loadCategories, loadCities, loadSettings } from "@/features/protected/admin/lib/admin-data";
import { redirect } from "next/navigation";
import { ADMIN_HOME, staffHome, staffRoles } from "@/features/protected/admin/lib/admin-nav";
import { greeting, summarize } from "@/features/protected/admin/lib/overview";

export const metadata: Metadata = { title: "Resumen · Administración" };

export default async function Page() {
  // Un moderador no tiene Resumen: su inicio es la cola de moderación.
  const me = await getCurrentUser(ADMIN_HOME);
  if (!me.roles.includes("admin")) redirect(staffHome(staffRoles(me.roles)));
  const [user, rental, service, cities, settings] = await Promise.all([
    getCurrentUser(ADMIN_HOME),
    loadCategories("rental", ADMIN_HOME),
    loadCategories("service", ADMIN_HOME),
    loadCities(ADMIN_HOME),
    loadSettings(ADMIN_HOME),
  ]);
  return (
    <AdminOverview
      greeting={greeting()}
      firstName={user.name.split(" ")[0]}
      cityNames={cities.filter((c) => c.enabled).map((c) => c.name)}
      summary={summarize(rental, service, cities, settings)}
    />
  );
}
