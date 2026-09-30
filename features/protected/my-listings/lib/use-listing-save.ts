"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApiListing, ApiListingFields } from "@/lib/api";
import { callBff } from "@/lib/bff-client";
import { listingFields } from "./listings";

/**
 * Guardar una sección del editor: se manda el formulario completo (lo guardado más los cambios de
 * la sección) con la versión leída. fieldByCode lleva los errores de qatu-api a su campo; lo demás
 * sale como aviso general. Si otra pestaña la cambió, se recarga lo último.
 */
export function useListingSave<F extends string>(listing: ApiListing, fieldByCode: Record<string, F>) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [errors, setErrors] = useState<Partial<Record<F, string>>>({});

  function reset(clientErrors: Partial<Record<F, string>> = {}) {
    setErrors(clientErrors);
    setAlert(undefined);
    setNotice(undefined);
  }

  async function save(changes: Partial<ApiListingFields>): Promise<boolean> {
    setPending(true);
    const result = await callBff<ApiListing>(`/api/me/listings/${listing.id}`, {
      method: "PUT",
      body: { ...listingFields(listing), ...changes, version: listing.version },
    });
    setPending(false);
    if (result.ok) {
      setNotice("Guardamos los cambios.");
      router.refresh();
      return true;
    }
    const field = Object.hasOwn(fieldByCode, result.error.error) ? fieldByCode[result.error.error] : undefined;
    if (field) setErrors({ [field]: result.error.message } as Partial<Record<F, string>>);
    else setAlert(result.error.message);
    if (result.error.error === "version_desactualizada") router.refresh();
    return false;
  }

  return { save, pending, alert, notice, errors, reset };
}
