"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormAlert, FormNotice } from "@/components/form/form-alert";
import { SelectField } from "@/components/form/select-field";
import { TextareaField } from "@/components/form/textarea-field";
import { TextField } from "@/components/form/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiCategory, ApiListing, ApiListingFields } from "@/lib/api";
import { callBff } from "@/lib/bff-client";
import { attributeFields, readAttributes } from "@/features/protected/my-listings/lib/attributes";
import {
  findToolType,
  isEditable,
  LISTING_TEXT_MAX,
  LISTING_TITLE_MAX,
  LISTING_TITLE_MIN,
  listingFields,
  parseAccessories,
  STATUS_TEXT,
  toolTypeOptions,
} from "@/features/protected/my-listings/lib/listings";
import { AttributeFields } from "./attribute-fields";

type Field = "category_id" | "title" | "description" | "accessories" | "usage_instructions" | "attributes";

// Códigos de qatu-api que corresponden a un campo de esta sección.
const FIELD_BY_CODE: Record<string, Field> = {
  titulo_invalido: "title",
  texto_largo: "description",
  accesorios_invalidos: "accessories",
  atributos_invalidos: "attributes",
  categoria_no_publicable: "category_id",
  categoria_prohibida: "category_id",
  categoria_fija: "category_id",
};

interface ListingEditorProps {
  listing: ApiListing;
  categories: ApiCategory[];
}

// Editor de una publicación. Cada guardado manda el formulario completo con la versión leída
// (bloqueo optimista): si otra pestaña la cambió, se avisa y se recarga lo último.
export function ListingEditor({ listing, categories }: ListingEditorProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const editable = isEditable(listing.status);
  // La categoría se elige mientras no se haya publicado (después se duplica).
  const categoryLocked = listing.status !== "draft" && listing.status !== "rejected";
  const [categoryId, setCategoryId] = useState(listing.category_id);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [attrErrors, setAttrErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [pending, setPending] = useState(false);
  const status = STATUS_TEXT[listing.status];
  const type = findToolType(categories, categoryId);
  const fields = attributeFields(type?.type.attributes_schema);

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [errors, attrErrors]);

  async function save(changes: Partial<ApiListingFields>) {
    setPending(true);
    const result = await callBff<ApiListing>(`/api/me/listings/${listing.id}`, {
      method: "PUT",
      body: { ...listingFields(listing), ...changes, version: listing.version },
    });
    setPending(false);
    if (result.ok) {
      setNotice("Guardamos los cambios.");
      router.refresh();
      return;
    }
    const field = FIELD_BY_CODE[result.error.error];
    if (field) setErrors({ [field]: result.error.message });
    else setAlert(result.error.message);
    if (result.error.error === "version_desactualizada") router.refresh();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "");
    const title = text("title").trim().replace(/\s+/g, " ");
    const accessories = parseAccessories(text("accessories"));
    const attrs = readAttributes(
      fields,
      (name) => (fields.find((f) => f.name === name)?.kind === "boolean" ? form.get(`attr.${name}`) === "on" : text(`attr.${name}`)),
      // En borrador se guarda incompleto; publicada o pausada debe seguir completa.
      { requireAll: listing.status === "published" || listing.status === "paused" },
    );
    const clientErrors: Partial<Record<Field, string>> = {};
    if (title.length < LISTING_TITLE_MIN || title.length > LISTING_TITLE_MAX)
      clientErrors.title = `Entre ${LISTING_TITLE_MIN} y ${LISTING_TITLE_MAX} caracteres.`;
    if (text("description").length > LISTING_TEXT_MAX) clientErrors.description = `Como máximo ${LISTING_TEXT_MAX} caracteres.`;
    if (text("usage_instructions").length > LISTING_TEXT_MAX)
      clientErrors.usage_instructions = `Como máximo ${LISTING_TEXT_MAX} caracteres.`;
    if (accessories.length > 30 || accessories.some((a) => a.length > 80))
      clientErrors.accessories = "Hasta 30 accesorios de 80 caracteres como máximo.";
    setErrors(clientErrors);
    setAttrErrors(attrs.errors);
    setAlert(undefined);
    setNotice(undefined);
    if (Object.keys(clientErrors).length > 0 || Object.keys(attrs.errors).length > 0) return;

    await save({
      category_id: categoryId,
      title,
      description: text("description").trim(),
      attributes: attrs.values,
      accessories,
      usage_instructions: text("usage_instructions").trim(),
    });
  }

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-line bg-bg p-4">
        <Badge tone={status.tone}>{status.label}</Badge>
        <p className="min-w-0 flex-1 text-sm text-ink-2">{status.hint}</p>
      </div>
      {listing.status === "rejected" && listing.rejection_reason && (
        <p className="rounded-[var(--radius-card)] border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <span className="font-medium">Motivo de la revisión: </span>
          {listing.rejection_reason}
        </p>
      )}

      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        aria-labelledby="seccion-herramienta"
        className="@container flex flex-col gap-5 rounded-[var(--radius-card)] border border-line bg-bg p-5 sm:p-6"
      >
        <div>
          <h2 id="seccion-herramienta" className="text-lg font-semibold">
            La herramienta
          </h2>
          <p className="mt-1 text-sm text-ink-2">Lo que ven quienes la buscan. Mientras más clara, menos dudas al reservar.</p>
        </div>
        <FormAlert>{alert}</FormAlert>
        <FormNotice>{notice}</FormNotice>
        <fieldset disabled={!editable || pending} className="flex min-w-0 flex-col gap-5">
          <div className="grid gap-4 @md:grid-cols-2">
            <SelectField
              label="Tipo de herramienta"
              name="category_id"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={categoryLocked}
              options={toolTypeOptions(categories)}
              error={errors.category_id}
            />
            <TextField
              label="Título"
              name="title"
              defaultValue={listing.title}
              maxLength={LISTING_TITLE_MAX}
              error={errors.title}
            />
          </div>
          {categoryLocked && (
            <p className="-mt-3 text-xs text-ink-3">Ya publicada: para otro tipo de herramienta, duplícala desde Mis publicaciones.</p>
          )}
          {fields.length > 0 && (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-sm font-medium text-ink">Datos de la herramienta</legend>
              {errors.attributes && <p className="text-sm text-destructive">{errors.attributes}</p>}
              <AttributeFields key={categoryId} fields={fields} values={listing.attributes ?? {}} errors={attrErrors} />
            </fieldset>
          )}
          <TextareaField
            label="Descripción (opcional)"
            name="description"
            defaultValue={listing.description}
            rows={4}
            maxLength={LISTING_TEXT_MAX}
            hint="Estado, para qué trabajos sirve y lo que conviene saber antes de alquilarla."
            error={errors.description}
          />
          <TextareaField
            label="Accesorios incluidos (opcional)"
            name="accessories"
            defaultValue={listing.accessories.join("\n")}
            rows={4}
            hint="Uno por línea. Se revisan al entregar y al devolver la herramienta."
            error={errors.accessories}
          />
          <TextareaField
            label="Instrucciones de uso (opcional)"
            name="usage_instructions"
            defaultValue={listing.usage_instructions}
            rows={3}
            maxLength={LISTING_TEXT_MAX}
            error={errors.usage_instructions}
          />
          {editable && (
            <div>
              <Button type="submit" disabled={pending} className="h-11 rounded-[var(--radius-control)] px-6">
                {pending ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          )}
        </fieldset>
      </form>
    </div>
  );
}
