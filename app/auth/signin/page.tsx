import type { Metadata } from "next";
import { SigninView } from "@/features/auth/signin/components/signin-view";
import { NEXT_PARAM } from "@/lib/session";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function Page({ searchParams }: PageProps<"/auth/signin">) {
  const next = (await searchParams)[NEXT_PARAM];
  return <SigninView next={typeof next === "string" ? next : undefined} />;
}
