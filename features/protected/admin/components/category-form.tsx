"use client";

import { useEffect, useRef, useState } from "react";
import { CheckboxField } from "@/components/form/checkbox-field";
import { FormAlert } from "@/components/form/form-alert";
import { SelectField } from "@/components/form/select-field";
import { TextareaField } from "@/components/form/textarea-field";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import type { ApiAdminCategory, RiskLevel, Vertical } from "@/lib/api";
import { CATALOG_ICONS } from "@/lib/catalog-icons";
import {
  CATEGORY_DESCRIPTION_MAX,
  CATEGORY_NAME_MAX,
  categoryFieldForError,
  parentOptions,
  parseSchema,
  RISK_LABELS,
  slugify,
  validateCategory,
  type CategoryField,
} from "@/features/protected/admin/lib/categories";
import { useAdminAction } from "@/features/protected/admin/lib/use-admin-action";

const EMPTY_SCHEMA = { type: "object", properties: {} };

const RISK_OPTIONS = (Object.keys(RISK_LABELS) as RiskLevel[]).map((value) => ({ value, label: RISK_LABELS[value] }));

// Íconos que la app sabe dibujar (lib/catalog-icons.ts); uno guardado que no esté, se conserva.
function iconOptions(current?: string) {
  const names = Object.keys(CATALOG_ICONS);
  if (current && !names.includes(current)) names.push(current);
  return [{ value: "", label: "Sin ícono" }, ...names.sort().map((name) => ({ value: name, label: name }))];
}

interface CategoryFormProps {
  vertical: Vertical;
  roots: ApiAdminCategory[];
  /** Al editar, la categoría; al crear, undefined. */
  category?: ApiAdminCategory;
  /** Al crear un tipo dentro de una categoría, su padre. */
  parentId?: string;
  onDone(): void;
  onCancel(): void;
}

// Crear o editar una categoría (o un oficio). El identificador se sugiere del nombre al crear.
export function CategoryForm({ vertical, roots, category, parentId, onDone, onCancel }: CategoryFormProps) {
  const { run, pending, alert, setAlert } = useAdminAction();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Partial<Record<CategoryField, string>>>({});
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const hasChildren = Boolean(category?.children?.length);

  // Tras un error, el foco va al primer campo inválido.
  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [errors]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "");
    const draft = {
      name,
      slug,
      description: text("description"),
      sortOrder: text("sort_order"),
      schema: text("attributes_schema"),
    };
    const clientErrors = validateCategory(draft);
    setErrors(clientErrors);
    setAlert(undefined);
    if (Object.keys(clientErrors).length > 0) return;

    const body = {
      parent_id: text("parent_id"),
      slug: draft.slug.trim(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      icon: text("icon"),
      sort_order: Number(draft.sortOrder),
      attributes_schema: parseSchema(draft.schema),
      risk_level: text("risk_level"),
      prohibited: form.get("prohibited") === "on",
      enabled: form.get("enabled") === "on",
    };
    const result = category
      ? await run(`/catalog/categories/${category.id}`, { method: "PATCH", body })
      : await run("/catalog/categories", { method: "POST", body: { ...body, vertical } });
    if (result.ok) return onDone();

    const field = categoryFieldForError(result.error.error);
    if (field) {
      setAlert(undefined);
      setErrors({ [field]: result.error.message });
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-bg-soft p-4 sm:p-5"
    >
      <FormAlert>{alert}</FormAlert>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nombre"
          name="name"
          value={name}
          maxLength={CATEGORY_NAME_MAX}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          autoFocus
          error={errors.name}
        />
        <TextField
          label="Identificador"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          hint={category ? "Va en las direcciones web: cambiarlo rompe los enlaces ya compartidos." : "Va en las direcciones web."}
          className="[&_input]:font-mono"
          error={errors.slug}
        />
      </div>
      <TextareaField
        label="Descripción (opcional)"
        name="description"
        defaultValue={category?.description}
        maxLength={CATEGORY_DESCRIPTION_MAX}
        rows={2}
        error={errors.description}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label="Pertenece a"
          name="parent_id"
          defaultValue={category?.parent_id ?? parentId ?? ""}
          options={[{ value: "", label: "Ninguna (principal)" }, ...parentOptions(roots, category?.id)]}
          disabled={hasChildren}
          error={errors.parent_id}
        />
        <SelectField label="Ícono" name="icon" defaultValue={category?.icon ?? ""} options={iconOptions(category?.icon)} />
        <SelectField
          label="Nivel de riesgo"
          name="risk_level"
          defaultValue={category?.risk_level ?? "medium"}
          options={RISK_OPTIONS}
        />
        <TextField
          label="Orden"
          name="sort_order"
          type="number"
          inputMode="numeric"
          min={0}
          defaultValue={category?.sort_order ?? 0}
          error={errors.sort_order}
        />
      </div>
      {hasChildren && (
        <p className="-mt-2 text-xs text-ink-3">Tiene tipos dentro: sigue siendo principal (el catálogo tiene 2 niveles).</p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
        <CheckboxField name="enabled" defaultChecked={category?.enabled ?? true}>
          Activa: se muestra en el catálogo
        </CheckboxField>
        <CheckboxField name="prohibited" defaultChecked={category?.prohibited ?? false}>
          Prohibida: no se puede publicar
        </CheckboxField>
      </div>
      <TextareaField
        label="Atributos (JSON Schema)"
        name="attributes_schema"
        defaultValue={JSON.stringify(category?.attributes_schema ?? EMPTY_SCHEMA, null, 2)}
        rows={6}
        spellCheck={false}
        hint="Campos propios del formulario de publicación, por ejemplo potencia o voltaje."
        className="[&_textarea]:font-mono [&_textarea]:text-sm"
        error={errors.attributes_schema}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending} className="h-10 rounded-[var(--radius-control)]">
          {pending ? "Guardando…" : category ? "Guardar cambios" : "Crear"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-10 rounded-[var(--radius-control)]">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
