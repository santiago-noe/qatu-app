import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Sin autorización" };

export default function UnauthorizedPage() {
  return (
    <ComingSoon
      title="No tienes acceso a esta página"
      description="Tu cuenta no tiene los permisos necesarios para ver este contenido."
    />
  );
}
