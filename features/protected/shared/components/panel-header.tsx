import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { LogoutButton } from "@/features/auth/shared/components/logout-button";

// Botones de la cabecera: en el celular solo el ícono (su texto va en PANEL_LABEL, legible para
// lectores de pantalla); desde sm, ícono y texto.
export const PANEL_ACTION = "h-10 rounded-[var(--radius-control)] max-sm:w-10 max-sm:px-0";
export const PANEL_LABEL = "max-sm:sr-only";

// Cabecera de las páginas con sesión (panel y administración): logo, enlaces propios y cerrar sesión.
export function PanelHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="border-b border-line bg-bg">
      <Container size="wide" className="flex h-16 items-center justify-between gap-4">
        <Logo priority />
        <div className="flex items-center gap-2">
          {children}
          <LogoutButton className={PANEL_ACTION} labelClassName={PANEL_LABEL} />
        </div>
      </Container>
    </header>
  );
}
