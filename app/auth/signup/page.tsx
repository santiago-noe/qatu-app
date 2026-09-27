import type { Metadata } from "next";
import { SignupView } from "@/features/auth/signup/components/signup-view";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function Page({ searchParams }: PageProps<"/auth/signup">) {
  const { error } = await searchParams;
  return <SignupView error={typeof error === "string" ? error : undefined} />;
}
