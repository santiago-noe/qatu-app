"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormAlert } from "@/components/form/form-alert";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import type { ApiCategory, ApiListing } from "@/lib/api";
import { callBff } from "@/lib/bff-client";
import { ROUTES } from "@/lib/session";
import { LISTING_TITLE_MAX, LISTING_TITLE_MIN, toolTypeOptions } from "@/features/protected/my-listings/lib/listings";

type Field = "category_id" | "title";

// Primer paso: qué herramienta es. Con eso se crea el borrador y el resto se completa en su página.
export function NewListingForm({ categories }: { categories: ApiCategory[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [alert, setAlert] = useState<string>();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [errors]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const categoryId = String(form.get("category_id") ?? "");
    const title = String(form.get("title") ?? "").trim().replace(/\s+/g, " ");
    const clientErrors: Partial<Record<Field, string>> = {};
    if (!categoryId) clientErrors.category_id = "Elige el tipo de herramienta.";
    if (title.length < LISTING_TITLE_MIN || title.length > LISTING_TITLE_MAX)
      clientErrors.title = `Entre ${LISTING_TITLE_MIN} y ${LISTING_TITLE_MAX} caracteres, por ejemplo «Rotomartillo Bosch 800 W».`;
    setErrors(clientErrors);
    setAlert(undefined);
    if (Object.keys(clientErrors).length > 0) return;

    setPending(true);
    const result = await callBff<ApiListing>("/api/me/listings", { method: "POST", body: { category_id: categoryId, title } });
    if (result.ok) {
      router.push(`${ROUTES.myListings}/${result.data.id}`);
      return;
    }
    setPending(false);
    if (result.error.error === "titulo_invalido") setErrors({ title: result.error.message });
    else if (result.error.error === "categoria_no_publicable" || result.error.error === "categoria_prohibida")
      setErrors({ category_id: result.error.message });
    else setAlert(result.error.message);
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="flex max-w-2xl flex-col gap-5 rounded-[var(--radius-card)] border border-line bg-bg p-5 sm:p-6"
    >
      <FormAlert>{alert}</FormAlert>
      <SelectField
        label="Tipo de herramienta"
        name="category_id"
        defaultValue=""
        placeholder="Elige el tipo"
        options={toolTypeOptions(categories)}
        error={errors.category_id}
      />
      <TextField
        label="Título"
        name="title"
        maxLength={LISTING_TITLE_MAX}
        placeholder="Rotomartillo Bosch 800 W"
        hint="Marca, modelo y lo que la distingue. Es lo primero que se ve al buscar."
        error={errors.title}
      />
      <div>
        <Button type="submit" disabled={pending} className="h-11 rounded-[var(--radius-control)] px-6">
          {pending ? "Creando…" : "Continuar"}
        </Button>
      </div>
    </form>
  );
}
