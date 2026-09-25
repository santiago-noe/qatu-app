import { ComingSoon } from "@/components/layout/coming-soon";

export function LegalPlaceholder({ title }: { title: string }) {
  return (
    <ComingSoon
      title={title}
      description="Este documento se publicará antes del lanzamiento, tras su revisión legal."
    />
  );
}
