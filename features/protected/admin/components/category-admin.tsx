"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiAdminCategory, Vertical } from "@/lib/api";
import { catalogIcon } from "@/lib/catalog-icons";
import { cn } from "@/lib/utils";
import { RISK_LABELS, VERTICAL_TEXT } from "@/features/protected/admin/lib/categories";
import { useAdminAction } from "@/features/protected/admin/lib/use-admin-action";
import { ActionStatus } from "./action-status";
import { Badge } from "./badge";
import { CategoryForm } from "./category-form";

type Editing = { mode: "edit"; id: string } | { mode: "create"; parentId: string } | null;

interface CategoryAdminProps {
  vertical: Vertical;
  roots: ApiAdminCategory[];
}

// Árbol de categorías (o de oficios) de una vertical: crear, editar, encender y apagar.
// Cada cambio limpia la caché del catálogo en qatu-api: la landing lo muestra en la siguiente visita.
export function CategoryAdmin({ vertical, roots }: CategoryAdminProps) {
  const text = VERTICAL_TEXT[vertical];
  const { run, pending, alert, notice, setNotice } = useAdminAction();
  const [editing, setEditing] = useState<Editing>(null);

  const isEditing = (id: string) => editing?.mode === "edit" && editing.id === id;
  const isCreatingIn = (parentId: string) => editing?.mode === "create" && editing.parentId === parentId;

  function done(message: string) {
    setEditing(null);
    setNotice(message);
  }

  async function toggle(category: ApiAdminCategory) {
    const enabled = !category.enabled;
    await run(`/catalog/categories/${category.id}`, {
      method: "PATCH",
      body: { enabled },
      success: `${category.name}: ${enabled ? "encendida" : "apagada"}.`,
    });
  }

  function form(category?: ApiAdminCategory, parentId?: string) {
    return (
      <CategoryForm
        vertical={vertical}
        roots={roots}
        category={category}
        parentId={parentId}
        onDone={() => done(category ? `Guardamos «${category.name}».` : "Creada.")}
        onCancel={() => setEditing(null)}
      />
    );
  }

  function row(category: ApiAdminCategory, depth: 0 | 1) {
    const Icon = catalogIcon(category.icon);
    return (
      <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 py-3", depth === 1 && "pl-6 sm:pl-10")}>
        <Icon className="size-5 shrink-0 text-ink-2" strokeWidth={1.5} aria-hidden />
        <div className="min-w-0 flex-1 basis-40 break-words">
          <p className={cn("font-medium", depth === 0 && "text-base", !category.enabled && "text-ink-3")}>{category.name}</p>
          <p className="font-mono text-xs text-ink-3">{category.slug}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {!category.enabled && <Badge>Apagada</Badge>}
          {category.prohibited && <Badge tone="danger">Prohibida</Badge>}
          <Badge tone={category.risk_level === "high" ? "warn" : "neutral"}>Riesgo {RISK_LABELS[category.risk_level].toLowerCase()}</Badge>
        </div>
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(isEditing(category.id) ? null : { mode: "edit", id: category.id })}
            aria-expanded={isEditing(category.id)}
            aria-label={`Editar ${category.name}`}
          >
            Editar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => toggle(category)}
            aria-label={`${category.enabled ? "Apagar" : "Encender"} ${category.name}`}
          >
            {category.enabled ? "Apagar" : "Encender"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ActionStatus alert={alert} notice={notice} />

      <div>
        <Button
          type="button"
          onClick={() => setEditing(isCreatingIn("") ? null : { mode: "create", parentId: "" })}
          aria-expanded={isCreatingIn("")}
          className="h-10 rounded-[var(--radius-control)]"
        >
          <Plus strokeWidth={1.75} aria-hidden />
          {text.newRoot}
        </Button>
      </div>
      {isCreatingIn("") && form()}

      {roots.length === 0 && <p className="text-ink-2">Aún no hay nada aquí.</p>}
      <ul className="flex flex-col gap-3">
        {roots.map((root) => (
          <li key={root.id} className="rounded-[var(--radius-card)] border border-line bg-bg px-4 sm:px-5">
            {row(root, 0)}
            {isEditing(root.id) && <div className="pb-4">{form(root)}</div>}
            {(root.children?.length ?? 0) > 0 && (
              <ul className="divide-y divide-line border-t border-line">
                {root.children?.map((child) => (
                  <li key={child.id}>
                    {row(child, 1)}
                    {isEditing(child.id) && <div className="pb-4 sm:pl-10">{form(child)}</div>}
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-line py-2.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditing(isCreatingIn(root.id) ? null : { mode: "create", parentId: root.id })}
                aria-expanded={isCreatingIn(root.id)}
                className="h-auto min-h-8 whitespace-normal py-1.5 text-left text-brand-text"
              >
                <Plus strokeWidth={1.75} aria-hidden />
                Agregar {text.child} en {root.name}
              </Button>
            </div>
            {isCreatingIn(root.id) && <div className="pb-4">{form(undefined, root.id)}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
