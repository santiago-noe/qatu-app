import type { Metadata } from "next";
import { RecoveryAccountView } from "@/features/auth/recovery-account/components/recovery-account-view";

export const metadata: Metadata = { title: "Recuperar cuenta" };

export default function Page() {
  return <RecoveryAccountView />;
}
