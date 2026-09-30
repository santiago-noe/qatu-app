// Datos del arrendador para Server Components (usan la sesión de la cookie).
import { redirect } from "next/navigation";
import type { ApiLender, ApiListing, ApiPhoto } from "@/lib/api";
import { authedGet } from "@/lib/current-user";
import { ROUTES, withNext } from "@/lib/session";

export async function loadLender(returnTo: string): Promise<ApiLender | null> {
  const { lender } = await authedGet<{ lender: ApiLender | null }>("/me/lender", returnTo);
  return lender;
}

/** El perfil de arrendador, o lleva a activarlo y vuelve a returnTo. */
export async function requireLender(returnTo: string): Promise<ApiLender> {
  const lender = await loadLender(returnTo);
  if (!lender) redirect(withNext(ROUTES.lender, returnTo));
  return lender;
}

export async function loadMyListings(returnTo: string): Promise<ApiListing[]> {
  const { listings } = await authedGet<{ listings: ApiListing[] }>("/me/listings", returnTo);
  return listings;
}

/** Una publicación del usuario; 404 si no existe o es de otra persona. */
export function loadMyListing(id: string): Promise<ApiListing> {
  return authedGet<ApiListing>(`/me/listings/${encodeURIComponent(id)}`, `${ROUTES.myListings}/${id}`);
}

export async function loadMyListingPhotos(id: string): Promise<ApiPhoto[]> {
  const { photos } = await authedGet<{ photos: ApiPhoto[] }>(
    `/me/listings/${encodeURIComponent(id)}/photos`,
    `${ROUTES.myListings}/${id}`,
  );
  return photos;
}
