import type { Metadata } from "next";
import { ChangePasswordView } from "@/features/auth/change-password/components/change-password-view";

export const metadata: Metadata = { title: "Cambiar contraseña" };

export default function Page() {
  return <ChangePasswordView />;
}
