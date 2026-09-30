"use client";

import { useState } from "react";
import { MousePointerClick, Plus, X } from "lucide-react";
import { IconBadge } from "@/components/layout/icon-badge";
import { Button } from "@/components/ui/button";
import type { ApiAdminCategory, Vertical } from "@/lib/api";
import { catalogIcon } from "@/lib/catalog-icons";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import {
  filterTree,
  flattenTree,
  RISK_LABELS,
  TREE_FILTERS,
  VERTICAL_TEXT,
  type TreeFilter,
} from "@/features/protected/admin/lib/categories";
import { useAdminAction } from "@/features/protected/admin/lib/use-admin-action";
import { ActionStatus } from "./action-status";
import { Badge } from "@/components/ui/badge";
import { CategoryCities } from "./category-cities";
import { CategoryForm } from "./category-form";

type Editing = { mode: "edit"; id: string } | { mode: "create"; parentId: string } | null;

interface CategoryAdminProps {
  vertical: Vertical;
  roots: ApiAdminCategory[];
}

// Árbol de categorías (o de oficios) de una vertical: crear, editar, encender y apagar, en general
// o por ciudad. En
// escritorio el formulario va en un panel fijo a la derecha; en el celular, dentro de la lista.
// Cada cambio limpia la caché del catálogo en qatu-api: la landing lo muestra en la siguiente visita.
export function CategoryAdmin({ vertical, roots }: CategoryAdminProps) {
  const text = VERTICAL_TEXT[vertical];
  const wide = useMediaQuery("(min-width: 1024px)");
  const { run, pending, alert, notice, setNotice } = useAdminAction();
  const [editing, setEditing] = useState<Editing>(null);
  const [filter, setFilter] = useState<TreeFilter>("all");

  const visible = filterTree(roots, filter);
  const isEditing = (id: string) => editing?.mode === "edit" && editing.id === id;
  const isCreatingIn = (parentId: string) => editing?.mode === "create" && editing.parentId === parentId;
  const find = (id: string) => flattenTree(roots).find((f) => f.category.id === id)?.category;

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

  function form(className?: string) {
    if (!editing) return null;
    const category = editing.mode === "edit" ? find(editing.id) : undefined;
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <CategoryForm
          key={editing.mode === "edit" ? editing.id : `new-${editing.parentId}`}
          vertical={vertical}
          roots={roots}
          category={category}
          parentId={editing.mode === "create" ? editing.parentId : undefined}
          onDone={() => done(category ? `Guardamos «${category.name}».` : "Creada.")}
          onCancel={() => setEditing(null)}
        />
        {category && <CategoryCities key={category.id} category={category} />}
      </div>
    );
  }

  // En el celular el formulario aparece donde se pidió.
  const inline = (show: boolean) =>
    !wide && show ? <div className="pb-4">{form("rounded-[var(--radius-card)] border border-line bg-bg-soft p-4")}</div> : null;

  function panelTitle() {
    if (!editing) return "";
    if (editing.mode === "edit") return `Editar «${find(editing.id)?.name ?? ""}»`;
    const parent = editing.parentId ? find(editing.parentId) : undefined;
    return parent ? `Nuevo ${text.child} en ${parent.name}` : text.newRoot;
  }

  function row(category: ApiAdminCategory, depth: 0 | 1) {
    const Icon = catalogIcon(category.icon);
    const selected = isEditing(category.id);
    return (
      <div
        className={cn(
          "-mx-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[var(--radius-control)] px-2 py-3",
          depth === 1 && "pl-8 sm:pl-12",
          selected && wide && "bg-cream",
        )}
      >
        <Icon className="size-5 shrink-0 text-ink-2" strokeWidth={1.5} aria-hidden />
        <div className="min-w-0 flex-1 basis-40 break-words">
          <p className={cn("font-medium", depth === 0 && "text-base", !category.enabled && "text-ink-3")}>{category.name}</p>
          <p className="font-mono text-xs text-ink-3">{category.slug}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {!category.enabled && <Badge>Apagada</Badge>}
          {category.prohibited && <Badge tone="danger">Prohibida</Badge>}
          <Badge tone={category.risk_level === "high" ? "warn" : "neutral"}>
            Riesgo {RISK_LABELS[category.risk_level].toLowerCase()}
          </Badge>
        </div>
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(selected ? null : { mode: "edit", id: category.id })}
            aria-expanded={selected}
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Mostrar" className="flex flex-wrap gap-1.5">
          {TREE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "h-9 rounded-full border px-3.5 text-sm font-medium transition-colors",
                filter === f.value ? "border-ink bg-ink text-white" : "border-line bg-bg text-ink-2 hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
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

      <ActionStatus alert={alert} notice={notice} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex min-w-0 flex-col gap-3">
          {inline(isCreatingIn(""))}
          {visible.length === 0 && (
            <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-bg p-6 text-center text-ink-2">
              Nada que mostrar con este filtro.
            </p>
          )}
          <ul className="flex flex-col gap-3">
            {visible.map((root) => (
              <li key={root.id} className="rounded-[var(--radius-card)] border border-line bg-bg px-4 shadow-[var(--shadow-card)] sm:px-5">
                {row(root, 0)}
                {inline(isEditing(root.id))}
                {(root.children?.length ?? 0) > 0 && (
                  <ul className="divide-y divide-line border-t border-line">
                    {root.children?.map((child) => (
                      <li key={child.id}>
                        {row(child, 1)}
                        {inline(isEditing(child.id))}
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
                {inline(isCreatingIn(root.id))}
              </li>
            ))}
          </ul>
        </div>

        {wide && (
          <aside
            aria-label={editing ? panelTitle() : "Editor"}
            className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[var(--radius-card)] border border-line bg-bg p-5 shadow-[var(--shadow-card)]"
          >
            {editing ? (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold">{panelTitle()}</h2>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Cerrar editor" onClick={() => setEditing(null)}>
                    <X strokeWidth={1.75} aria-hidden />
                  </Button>
                </div>
                {form()}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <IconBadge icon={MousePointerClick} />
                <p className="text-sm text-ink-2">
                  Pulsa <strong className="font-medium text-ink">Editar</strong> en una fila para cambiarla aquí, o crea una
                  nueva.
                </p>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
