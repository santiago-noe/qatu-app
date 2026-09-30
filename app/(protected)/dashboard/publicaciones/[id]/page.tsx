import type { Metadata } from "next";
import { loadCitiesWithZones, loadRentalCategories } from "@/lib/catalog";
import { ROUTES } from "@/lib/session";
import { ListingEditor } from "@/features/protected/my-listings/components/listing-editor";
import { loadMyListing, loadMyListingPhotos, requireLender } from "@/features/protected/my-listings/lib/data";
import { PanelPage } from "@/features/protected/shared/components/panel-page";

export const metadata: Metadata = { title: "Editar publicación" };

export default async function Page({ params }: PageProps<"/dashboard/publicaciones/[id]">) {
  const { id } = await params;
  const lender = await requireLender(`${ROUTES.myListings}/${id}`);
  const [listing, photos, categories, cities] = await Promise.all([
    loadMyListing(id),
    loadMyListingPhotos(id),
    loadRentalCategories(lender.city.slug),
    loadCitiesWithZones(),
  ]);
  const city = cities.find((c) => c.city.slug === lender.city.slug);
  return (
    <PanelPage title={listing.title} back={{ href: ROUTES.myListings, label: "Mis publicaciones" }}>
      {/* Al guardar, la página se vuelve a leer: el editor recibe la versión nueva sin perder los avisos. */}
      <ListingEditor
        key={listing.id}
        listing={listing}
        categories={categories}
        photos={photos}
        cityCenter={city?.city.center ?? { lat: -13.1631, lng: -74.2236 }}
        zones={city?.zones ?? []}
      />
    </PanelPage>
  );
}
