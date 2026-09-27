import { useEffect, useState } from "react";

interface Options {
  /** Por encima de esta posición (px) siempre se muestra. */
  offset?: number;
  /** Desplazamiento mínimo (px) para cambiar de estado; evita parpadeos. */
  tolerance?: number;
  /** Si es false, siempre visible (por ejemplo, con un menú abierto). */
  enabled?: boolean;
}

// true cuando el usuario baja; false cuando sube o está cerca del inicio.
export function useHideOnScroll({ offset = 96, tolerance = 8, enabled = true }: Options = {}): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setHidden(false);
      return;
    }
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      if (y <= offset) setHidden(false);
      else if (delta > tolerance) setHidden(true);
      else if (delta < -tolerance) setHidden(false);
      if (Math.abs(delta) > tolerance || y <= offset) lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [offset, tolerance, enabled]);

  return hidden;
}
