import type { Metadata } from "next";
import { DashboardView } from "@/features/protected/dashboard/components/dashboard-view";
import { LenderCard } from "@/features/protected/my-listings/components/lender-card";
import { loadLender, loadMyListings } from "@/features/protected/my-listings/lib/data";
import { LocationCard } from "@/features/protected/profile/components/location-card";
import { loadLocationCard } from "@/features/protected/profile/lib/location-data";
import { getCurrentUser } from "@/lib/current-user";
import { ROUTES } from "@/lib/session";

export const metadata: Metadata = { title: "Mi panel" };

export default async function Page() {
  const [user, location, lender] = await Promise.all([getCurrentUser(), loadLocationCard(), loadLender(ROUTES.dashboard)]);
  const listings = lender ? await loadMyListings(ROUTES.dashboard) : [];
  return (
    <DashboardView user={user}>
      <LocationCard cities={location.cities} current={location.current} />
      <LenderCard lender={lender} listings={listings.length} />
    </DashboardView>
  );
}
