"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface CheckboxFieldProps extends Omit<React.ComponentProps<"input">, "id" | "type" | "children"> {
  /** Texto de la etiqueta; puede incluir enlaces (términos, privacidad). */
  children: React.ReactNode;
  error?: string;
}

// Casilla nativa (funciona con FormData y el teclado sin JavaScript extra); toda la etiqueta es clicable.
export function CheckboxField({ children, error, className, ...props }: CheckboxFieldProps) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-ink"
          {...props}
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-6 text-ink-2">
          {children}
        </label>
      </div>
      {error && (
        <p id={errorId} className="pl-8 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
