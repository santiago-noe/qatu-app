import type { Metadata } from "next";
import { SigninView } from "@/features/auth/signin/components/signin-view";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function Page() {
  return <SigninView />;
}
