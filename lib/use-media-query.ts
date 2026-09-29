"use client";

import { useSyncExternalStore } from "react";

/**
 * Si la pantalla cumple la media query (por ejemplo "(min-width: 1024px)"). En el servidor es
 * false: úsalo solo para lo que aparece tras una acción del usuario, no en el primer render.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
