import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerifyEmailView } from "@/features/auth/verify-email/components/verify-email-view";
import { getCurrentUser } from "@/lib/current-user";
import { ROUTES } from "@/lib/session";

export const metadata: Metadata = { title: "Confirma tu correo" };

export default async function Page() {
  const user = await getCurrentUser(ROUTES.verifyEmail);
  if (user.email_verified) redirect(ROUTES.dashboard);
  return <VerifyEmailView email={user.email} />;
}
