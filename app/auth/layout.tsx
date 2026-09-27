import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";

// Pantallas de acceso: sin navegación del sitio, solo el logo para volver al inicio.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-soft">
      <header className="border-b border-line bg-bg">
        <Container size="wide" className="flex h-16 items-center">
          <Logo priority />
        </Container>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center sm:py-16">{children}</main>
    </div>
  );
}
