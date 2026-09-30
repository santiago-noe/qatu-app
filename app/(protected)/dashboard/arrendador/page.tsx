import type { Metadata } from "next";
import type { ApiLocation } from "@/lib/api";
import { loadCitiesWithZones } from "@/lib/catalog";
import { authedGet, getCurrentUser } from "@/lib/current-user";
import { NEXT_PARAM, ROUTES, safeNextPath } from "@/lib/session";
import { LenderForm } from "@/features/protected/my-listings/components/lender-form";
import { loadLender } from "@/features/protected/my-listings/lib/data";
import { PanelPage } from "@/features/protected/shared/components/panel-page";
import { TextLink } from "@/features/auth/shared/components/text-link";

export const metadata: Metadata = { title: "Perfil de arrendador" };

export default async function Page({ searchParams }: PageProps<"/dashboard/arrendador">) {
  const next = safeNextPath((await searchParams)[NEXT_PARAM] as string | undefined, ROUTES.myListings);
  const [user, lender, cities, { location }] = await Promise.all([
    getCurrentUser(ROUTES.lender),
    loadLender(ROUTES.lender),
    loadCitiesWithZones(),
    authedGet<{ location: ApiLocation | null }>("/me/location", ROUTES.lender),
  ]);
  return (
    <PanelPage
      title={lender ? "Tu perfil de arrendador" : "Publica tus herramientas"}
      description={
        lender
          ? "Estos datos acompañan a todas tus publicaciones."
          : "Activa tu perfil para alquilar tus herramientas en Qatu. Solo te pedimos un celular y tu distrito."
      }
      back={{ href: lender ? ROUTES.myListings : ROUTES.dashboard, label: lender ? "Mis publicaciones" : "Mi panel" }}
    >
      {user.email_verified ? (
        <LenderForm
          lender={lender}
          cities={cities}
          defaultZone={location ? { city: location.city.slug, zone: location.zone.slug } : undefined}
          next={next}
        />
      ) : (
        <p className="max-w-2xl rounded-[var(--radius-card)] border border-line bg-bg p-5 text-ink-2">
          Primero confirma tu correo con el código que te enviamos.{" "}
          <TextLink href={ROUTES.verifyEmail}>Confirmar mi correo</TextLink>
        </p>
      )}
    </PanelPage>
  );
}
