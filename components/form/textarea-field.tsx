"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface TextareaFieldProps extends Omit<React.ComponentProps<"textarea">, "id"> {
  label: string;
  hint?: string;
  error?: string;
}

// Texto largo con el mismo estilo que TextField: etiqueta visible, ayuda y error enlazados.
export function TextareaField({ label, hint, error, className, ...props }: TextareaFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "min-h-24 w-full rounded-[var(--radius-control)] border border-line bg-bg-soft px-3 py-2.5 text-[15px] text-ink transition-colors placeholder:text-ink-3 hover:border-ink-3/50 focus-visible:border-ink focus-visible:bg-bg",
          error && "border-destructive",
        )}
        {...props}
      />
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
