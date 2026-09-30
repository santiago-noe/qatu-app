"use client";

import { useEffect, useRef } from "react";
import { FormAlert, FormNotice } from "@/components/form/form-alert";
import { Button } from "@/components/ui/button";

interface EditorSectionProps {
  id: string;
  title: string;
  description: string;
  editable: boolean;
  pending: boolean;
  alert?: string;
  notice?: string;
  /** Cambia al fallar la validación: el foco va al primer campo inválido. */
  errors: object;
  onSubmit(form: FormData): void;
  children: React.ReactNode;
}

// Una sección del editor de publicaciones: su propio formulario y su botón Guardar. Fuera de los
// estados editables se muestra solo para leer.
export function EditorSection({ id, title, description, editable, pending, alert, notice, errors, onSubmit, children }: EditorSectionProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [errors]);

  return (
    <form
      id={id}
      ref={formRef}
      noValidate
      aria-labelledby={`${id}-titulo`}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
      className="@container flex scroll-mt-6 flex-col gap-5 rounded-[var(--radius-card)] border border-line bg-bg p-5 sm:p-6"
    >
      <div>
        <h2 id={`${id}-titulo`} className="text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-1 text-sm text-ink-2">{description}</p>
      </div>
      <FormAlert>{alert}</FormAlert>
      <FormNotice>{notice}</FormNotice>
      <fieldset disabled={!editable || pending} className="flex min-w-0 flex-col gap-5">
        {children}
        {editable && (
          <div>
            <Button type="submit" disabled={pending} className="h-11 rounded-[var(--radius-control)] px-6">
              {pending ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        )}
      </fieldset>
    </form>
  );
}
