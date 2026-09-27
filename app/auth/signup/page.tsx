import type { Metadata } from "next";
import { SignupView } from "@/features/auth/signup/components/signup-view";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function Page() {
  return <SignupView />;
}
