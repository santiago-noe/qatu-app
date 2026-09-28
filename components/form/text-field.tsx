"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextFieldProps extends Omit<React.ComponentProps<"input">, "id"> {
  label: string;
  /** Ícono decorativo a la izquierda (sobre para el correo, candado para la contraseña). */
  icon?: LucideIcon;
  /** Enlace junto a la etiqueta, a la derecha (por ejemplo, "¿Olvidaste tu contraseña?"). */
  action?: React.ReactNode;
  /** Ayuda permanente bajo el campo (por ejemplo, la regla de la contraseña). */
  hint?: string;
  error?: string;
}

// Campo de texto accesible: etiqueta visible, ayuda y error enlazados con aria-describedby.
// Con type="password" agrega el botón para mostrar u ocultar lo escrito.
export function TextField({ label, icon: Icon, action, hint, error, type = "text", className, ...props }: TextFieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {action && <span className="text-[13px]">{action}</span>}
      </div>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-3"
            strokeWidth={1.5}
            aria-hidden
          />
        )}
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
          className={cn(
            "h-11 w-full rounded-[var(--radius-control)] border border-line bg-bg-soft px-3 text-[15px] text-ink transition-colors placeholder:text-ink-3 hover:border-ink-3/50 focus-visible:border-ink focus-visible:bg-bg",
            Icon && "pl-11",
            isPassword && "pr-12",
            error && "border-destructive",
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[var(--radius-control)] text-ink-2 hover:text-ink"
          >
            {revealed ? <EyeOff className="size-5" strokeWidth={1.5} /> : <Eye className="size-5" strokeWidth={1.5} />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-xs text-ink-3">
          {hint}
        </p>
      )}
    </div>
  );
}
