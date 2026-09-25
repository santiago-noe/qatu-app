import type { Metadata } from "next";
import { LegalPlaceholder } from "@/features/public/legal/components/legal-placeholder";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function Page() {
  return <LegalPlaceholder title="Términos y condiciones" />;
}
