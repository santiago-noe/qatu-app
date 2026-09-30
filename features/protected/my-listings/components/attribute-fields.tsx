"use client";

import { CheckboxField } from "@/components/form/checkbox-field";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { attributeInput, type AttributeField } from "@/features/protected/my-listings/lib/attributes";

interface AttributeFieldsProps {
  fields: AttributeField[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
}

// Campos que pide la categoría (marca, modelo, potencia…). Los nombres van con prefijo "attr."
// para leerlos del formulario sin chocar con los demás campos.
export function AttributeFields({ fields, values, errors }: AttributeFieldsProps) {
  if (fields.length === 0) return null;
  return (
    <div className="grid gap-4 @md:grid-cols-2">
      {fields.map((f) => {
        const name = `attr.${f.name}`;
        const label = f.required ? f.label : `${f.label} (opcional)`;
        const error = errors[f.name];
        switch (f.kind) {
          case "boolean":
            return (
              <CheckboxField key={f.name} name={name} defaultChecked={values[f.name] === true} error={error} className="@md:col-span-2">
                {f.label}
              </CheckboxField>
            );
          case "select":
            return (
              <SelectField
                key={f.name}
                label={label}
                name={name}
                defaultValue={attributeInput(values[f.name])}
                options={[{ value: "", label: f.required ? "Elige una opción" : "Sin indicar" }, ...(f.options ?? [])]}
                error={error}
              />
            );
          default:
            return (
              <TextField
                key={f.name}
                label={label}
                name={name}
                defaultValue={attributeInput(values[f.name])}
                inputMode={f.kind === "text" ? undefined : f.kind === "integer" ? "numeric" : "decimal"}
                maxLength={f.maxLength}
                hint={f.min !== undefined && f.max !== undefined ? `Entre ${f.min} y ${f.max}.` : undefined}
                error={error}
              />
            );
        }
      })}
    </div>
  );
}
