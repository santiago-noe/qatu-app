import type { Metadata } from "next";
import { loadRentalCategories } from "@/lib/catalog";
import { ROUTES } from "@/lib/session";
import { ListingEditor } from "@/features/protected/my-listings/components/listing-editor";
import { loadMyListing, requireLender } from "@/features/protected/my-listings/lib/data";
import { PanelPage } from "@/features/protected/shared/components/panel-page";

export const metadata: Metadata = { title: "Editar publicación" };

export default async function Page({ params }: PageProps<"/dashboard/publicaciones/[id]">) {
  const { id } = await params;
  const lender = await requireLender(`${ROUTES.myListings}/${id}`);
  const [listing, categories] = await Promise.all([loadMyListing(id), loadRentalCategories(lender.city.slug)]);
  return (
    <PanelPage title={listing.title} back={{ href: ROUTES.myListings, label: "Mis publicaciones" }}>
      {/* Al guardar, la página se vuelve a leer: el editor recibe la versión nueva sin perder el aviso. */}
      <ListingEditor key={listing.id} listing={listing} categories={categories} />
    </PanelPage>
  );
}
