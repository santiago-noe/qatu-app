import type { Metadata } from "next";
import { LegalPlaceholder } from "@/features/public/legal/components/legal-placeholder";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function Page() {
  return <LegalPlaceholder title="Política de privacidad" />;
}
