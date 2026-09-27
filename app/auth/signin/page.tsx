import type { Metadata } from "next";
import { SigninView } from "@/features/auth/signin/components/signin-view";
import { NEXT_PARAM } from "@/lib/session";

export const metadata: Metadata = { title: "Iniciar sesión" };

const param = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

export default async function Page({ searchParams }: PageProps<"/auth/signin">) {
  const params = await searchParams;
  return <SigninView next={param(params[NEXT_PARAM])} error={param(params.error)} />;
}
