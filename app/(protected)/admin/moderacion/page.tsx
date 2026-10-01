import type { Metadata } from "next";
import type { ApiReviewItem } from "@/lib/api";
import { loadCitiesWithZones } from "@/lib/catalog";
import { authedGet } from "@/lib/current-user";
import { AdminPage } from "@/features/protected/admin/components/admin-shell";
import { MODERATION_HOME } from "@/features/protected/admin/lib/admin-nav";
import { ModerationQueue } from "@/features/protected/moderation/components/moderation-queue";

export const metadata: Metadata = { title: "Moderación · Administración" };

export default async function Page() {
  const [{ listings }, cities] = await Promise.all([
    authedGet<{ listings: ApiReviewItem[] }>("/moderation/listings", MODERATION_HOME),
    loadCitiesWithZones(),
  ]);
  // Nombres de los distritos para el delivery (la publicación guarda sus IDs).
  const zones = Object.fromEntries(cities.flatMap((c) => c.zones.map((z) => [z.id, z.name])));
  return (
    <AdminPage
      title="Moderación"
      description="Primeras publicaciones de cada arrendador y herramientas de riesgo alto. Aprueba lo que cumple; si algo falta, rechaza y di qué corregir."
    >
      <ModerationQueue items={listings} zones={zones} />
    </AdminPage>
  );
}
