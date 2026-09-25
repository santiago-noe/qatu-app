import type { Metadata } from "next";
import { LegalPlaceholder } from "@/features/public/legal/components/legal-placeholder";

export const metadata: Metadata = { title: "Libro de Reclamaciones" };

export default function Page() {
  return <LegalPlaceholder title="Libro de Reclamaciones" />;
}
