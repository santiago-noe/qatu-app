"use client";

import { useState } from "react";
import { Mail, Search } from "lucide-react";
import { CheckboxField } from "@/components/form/checkbox-field";
import { TextareaField } from "@/components/form/textarea-field";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import type { ApiAdminUser } from "@/lib/api";
import { validateEmail } from "@/features/auth/shared/lib/validation";
import { INTERNAL_ROLES, roleLabel, rolesDiff } from "@/features/protected/admin/lib/users";
import { useAdminAction } from "@/features/protected/admin/lib/use-admin-action";
import { ActionStatus } from "./action-status";
import { Badge } from "./badge";

// Buscar una cuenta por su correo exacto (no hay listado masivo: datos mínimos, Ley 29733),
// asignar roles internos y suspender o reactivar. Cada cambio cierra las sesiones de esa persona.
export function UserAdmin() {
  const { run, pending, alert, notice, setAlert } = useAdminAction();
  const [user, setUser] = useState<ApiAdminUser | null>(null);
  const [emailError, setEmailError] = useState<string>();
  const [reasonError, setReasonError] = useState<string>();

  async function search(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setEmailError(validateEmail(email));
    if (validateEmail(email)) return;
    setUser(null);
    const result = await run<ApiAdminUser>(`/users?email=${encodeURIComponent(email)}`);
    if (result.ok) setUser(result.data);
    else if (result.error.error === "no_encontrado") setAlert("No hay ninguna cuenta con ese correo.");
  }

  async function saveRoles(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const form = new FormData(e.currentTarget);
    const { add, remove } = rolesDiff(user.roles, INTERNAL_ROLES.filter((r) => form.get(r) === "on"));
    if (add.length === 0 && remove.length === 0) {
      setAlert("No cambiaste ningún rol.");
      return;
    }
    const result = await run<ApiAdminUser>(`/users/${user.id}/roles`, {
      method: "PATCH",
      body: { add, remove },
      refresh: false,
      success: "Roles guardados. Sus sesiones se cerraron: al volver a entrar tendrá los nuevos permisos.",
    });
    if (result.ok) setUser(result.data);
  }

  async function changeStatus(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const suspend = user.status === "active";
    const reason = String(new FormData(e.currentTarget).get("reason") ?? "").trim();
    if (suspend && !reason) {
      setReasonError("Escribe el motivo: queda en la auditoría para el equipo.");
      return;
    }
    setReasonError(undefined);
    const result = await run<ApiAdminUser>(`/users/${user.id}/status`, {
      method: "PATCH",
      body: { status: suspend ? "suspended" : "active", reason },
      refresh: false,
      success: suspend ? "Cuenta suspendida y sesiones cerradas." : "Cuenta reactivada.",
    });
    if (result.ok) setUser(result.data);
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <form onSubmit={search} noValidate role="search" className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <TextField
          label="Correo de la cuenta"
          icon={Mail}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="off"
          placeholder="nombre@correo.pe"
          className="flex-1"
          error={emailError}
        />
        <Button type="submit" disabled={pending} className="h-11 rounded-[var(--radius-control)] sm:mt-[26px]">
          <Search strokeWidth={1.75} aria-hidden />
          Buscar
        </Button>
      </form>

      <ActionStatus alert={alert} notice={notice} />

      {user && (
        <section aria-labelledby="cuenta-encontrada" className="rounded-[var(--radius-card)] border border-line bg-bg p-4 sm:p-5">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 id="cuenta-encontrada" className="text-lg font-semibold">
                {user.name}
              </h2>
              <p className="text-sm text-ink-2">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone={user.email_verified ? "ok" : "neutral"}>
                {user.email_verified ? "Correo verificado" : "Correo sin verificar"}
              </Badge>
              <Badge tone={user.status === "active" ? "ok" : "danger"}>
                {user.status === "active" ? "Activa" : "Suspendida"}
              </Badge>
            </div>
          </div>
          <p className="mt-2 text-sm text-ink-2">
            Roles: {user.roles.map(roleLabel).join(", ")} · Nivel de verificación {user.verification_level}
          </p>

          {/* key: al cambiar de cuenta o de roles, las casillas vuelven a su estado real */}
          <form key={`${user.id}-${user.roles.join()}`} onSubmit={saveRoles} className="mt-5 border-t border-line pt-4">
            <fieldset>
              <legend className="text-sm font-semibold">Roles internos</legend>
              <p className="text-xs text-ink-3">Piden el código de dos pasos al iniciar sesión.</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-6">
                {INTERNAL_ROLES.map((role) => (
                  <CheckboxField key={role} name={role} defaultChecked={user.roles.includes(role)}>
                    {roleLabel(role)}
                  </CheckboxField>
                ))}
              </div>
            </fieldset>
            <Button type="submit" variant="outline" disabled={pending} className="mt-3 h-10 rounded-[var(--radius-control)]">
              Guardar roles
            </Button>
          </form>

          <form key={`${user.id}-${user.status}`} onSubmit={changeStatus} noValidate className="mt-5 border-t border-line pt-4">
            <h3 className="text-sm font-semibold">Estado de la cuenta</h3>
            {user.status === "active" ? (
              <>
                <p className="text-xs text-ink-3">
                  Suspendida, puede entrar a ver su historial, pero no alquilar, contratar ni publicar.
                </p>
                <TextareaField label="Motivo de la suspensión" name="reason" rows={2} className="mt-3" error={reasonError} />
                <Button type="submit" variant="destructive" disabled={pending} className="mt-3 h-10 rounded-[var(--radius-control)]">
                  Suspender cuenta
                </Button>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-ink-2">Motivo: {user.suspended_reason || "sin motivo registrado"}</p>
                <Button type="submit" disabled={pending} className="mt-3 h-10 rounded-[var(--radius-control)]">
                  Reactivar cuenta
                </Button>
              </>
            )}
          </form>
        </section>
      )}
    </div>
  );
}
