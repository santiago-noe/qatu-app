import type { Metadata } from "next";
import Link from "next/link";
import { Plus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/session";
import { MyListings } from "@/features/protected/my-listings/components/my-listings";
import { loadMyListings, requireLender } from "@/features/protected/my-listings/lib/data";
import { PanelPage } from "@/features/protected/shared/components/panel-page";

export const metadata: Metadata = { title: "Mis publicaciones" };

export default async function Page() {
  await requireLender(ROUTES.myListings);
  const listings = await loadMyListings(ROUTES.myListings);
  return (
    <PanelPage
      title="Mis publicaciones"
      description="Tus herramientas en alquiler. La primera pasa por una revisión antes de aparecer en Qatu."
      back={{ href: ROUTES.dashboard, label: "Mi panel" }}
      action={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="h-10 rounded-[var(--radius-control)]">
            <Link href={ROUTES.lender}>
              <UserRound strokeWidth={1.75} aria-hidden />
              Mi perfil de arrendador
            </Link>
          </Button>
          {listings.length > 0 && (
            <Button asChild className="h-10 rounded-[var(--radius-control)]">
              <Link href={`${ROUTES.myListings}/nueva`}>
                <Plus strokeWidth={1.75} aria-hidden />
                Nueva publicación
              </Link>
            </Button>
          )}
        </div>
      }
    >
      <MyListings listings={listings} />
    </PanelPage>
  );
}
