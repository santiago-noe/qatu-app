"use client";

import { useId } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<React.ComponentProps<"select">, "id" | "children"> {
  label: string;
  options: SelectOption[];
  /** Texto de la opción vacía inicial ("Elige tu distrito"). */
  placeholder?: string;
  icon?: LucideIcon;
  error?: string;
}

// Lista desplegable nativa: en el celular abre el selector del sistema, el más cómodo de usar.
// Mismo estilo que TextField (etiqueta visible, error enlazado con aria-describedby).
export function SelectField({ label, options, placeholder, icon: Icon, error, className, ...props }: SelectFieldProps) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-3"
            strokeWidth={1.5}
            aria-hidden
          />
        )}
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            "h-11 w-full cursor-pointer appearance-none rounded-[var(--radius-control)] border border-line bg-bg-soft pl-3 pr-10 text-[15px] text-ink transition-colors hover:border-ink-3/50 focus-visible:border-ink focus-visible:bg-bg",
            Icon && "pl-11",
            error && "border-destructive",
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-2"
          strokeWidth={1.75}
          aria-hidden
        />
      </div>
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
