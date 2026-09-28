import type { Metadata } from "next";
import { TwoFactorView } from "@/features/auth/two-factor/components/two-factor-view";
import { getCurrentUser } from "@/lib/current-user";
import { NEXT_PARAM, safeNextPath } from "@/lib/session";

export const metadata: Metadata = { title: "Código de acceso" };

export default async function Page({ searchParams }: PageProps<"/auth/two-factor">) {
  const raw = (await searchParams)[NEXT_PARAM];
  const next = safeNextPath(typeof raw === "string" ? raw : undefined);
  const user = await getCurrentUser(next);
  return <TwoFactorView email={user.email} next={next} />;
}
