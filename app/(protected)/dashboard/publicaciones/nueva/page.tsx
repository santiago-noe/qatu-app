import type { Metadata } from "next";
import { loadRentalCategories } from "@/lib/catalog";
import { ROUTES } from "@/lib/session";
import { NewListingForm } from "@/features/protected/my-listings/components/new-listing-form";
import { requireLender } from "@/features/protected/my-listings/lib/data";
import { PanelPage } from "@/features/protected/shared/components/panel-page";

export const metadata: Metadata = { title: "Nueva publicación" };

export default async function Page() {
  const lender = await requireLender(`${ROUTES.myListings}/nueva`);
  const categories = await loadRentalCategories(lender.city.slug);
  return (
    <PanelPage
      title="Nueva publicación"
      description="Empieza por qué herramienta es. Se guarda como borrador: puedes completarla cuando quieras."
      back={{ href: ROUTES.myListings, label: "Mis publicaciones" }}
    >
      <NewListingForm categories={categories} />
    </PanelPage>
  );
}
