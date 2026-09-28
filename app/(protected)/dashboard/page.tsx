import type { Metadata } from "next";
import { DashboardView } from "@/features/protected/dashboard/components/dashboard-view";
import { LocationCard } from "@/features/protected/profile/components/location-card";
import { loadLocationCard } from "@/features/protected/profile/lib/location-data";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Mi panel" };

export default async function Page() {
  const [user, location] = await Promise.all([getCurrentUser(), loadLocationCard()]);
  return (
    <DashboardView user={user}>
      <LocationCard cities={location.cities} current={location.current} />
    </DashboardView>
  );
}
