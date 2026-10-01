"use client";

import { useState } from "react";
import { SelectField } from "@/components/form/select-field";
import { TextareaField } from "@/components/form/textarea-field";
import { TextField } from "@/components/form/text-field";
import type { ApiCategory, ApiListing } from "@/lib/api";
import { attributeFields, readAttributes } from "@/lib/attributes";
import {
  ACCESSORIES_MAX,
  ACCESSORY_MAX,
  findToolType,
  LISTING_TEXT_MAX,
  LISTING_TITLE_MAX,
  LISTING_TITLE_MIN,
  parseAccessories,
  toolTypeOptions,
} from "@/features/protected/my-listings/lib/listings";
import { useListingSave } from "@/features/protected/my-listings/lib/use-listing-save";
import { AttributeFields } from "./attribute-fields";
import { EditorSection } from "./editor-section";

type Field = "category_id" | "title" | "description" | "accessories" | "usage_instructions" | "attributes";

const FIELD_BY_CODE: Record<string, Field> = {
  titulo_invalido: "title",
  texto_largo: "description",
  accesorios_invalidos: "accessories",
  atributos_invalidos: "attributes",
  categoria_no_publicable: "category_id",
  categoria_prohibida: "category_id",
  categoria_fija: "category_id",
};

interface ToolSectionProps {
  listing: ApiListing;
  categories: ApiCategory[];
  editable: boolean;
}

// La herramienta: tipo, título, los datos que pide su categoría, descripción y accesorios.
export function ToolSection({ listing, categories, editable }: ToolSectionProps) {
  const { save, pending, alert, notice, errors, reset } = useListingSave(listing, FIELD_BY_CODE);
  const [attrErrors, setAttrErrors] = useState<Record<string, string>>({});
  // La categoría se elige mientras no se haya publicado (después se duplica).
  const categoryLocked = listing.status !== "draft" && listing.status !== "rejected";
  const [categoryId, setCategoryId] = useState(listing.category_id);
  const fields = attributeFields(findToolType(categories, categoryId)?.type.attributes_schema);

  async function onSubmit(form: FormData) {
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
    if (accessories.length > ACCESSORIES_MAX || accessories.some((a) => a.length > ACCESSORY_MAX))
      clientErrors.accessories = `Hasta ${ACCESSORIES_MAX} accesorios de ${ACCESSORY_MAX} caracteres como máximo.`;
    reset(clientErrors);
    setAttrErrors(attrs.errors);
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
    <EditorSection
      id="herramienta"
      title="La herramienta"
      description="Lo que ven quienes la buscan. Mientras más clara, menos dudas al reservar."
      editable={editable}
      pending={pending}
      alert={alert}
      notice={notice}
      errors={{ ...errors, ...attrErrors }}
      onSubmit={onSubmit}
    >
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
        <TextField label="Título" name="title" defaultValue={listing.title} maxLength={LISTING_TITLE_MAX} error={errors.title} />
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
    </EditorSection>
  );
}
