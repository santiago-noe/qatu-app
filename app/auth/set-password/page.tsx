import type { Metadata } from "next";
import { SetPasswordView } from "@/features/auth/set-password/components/set-password-view";

export const metadata: Metadata = { title: "Crear contraseña" };

export default function Page() {
  return <SetPasswordView />;
}
