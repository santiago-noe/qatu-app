// Ubicación del navegador para detectar el distrito. Se pide solo al pulsar "Usar mi ubicación"
// y el punto no se guarda: se manda una vez a /api/geo/zone y se descarta.

/** Texto para cada fallo de la API de geolocalización (códigos de GeolocationPositionError). */
export function geolocationErrorMessage(code: number | "unsupported"): string {
  switch (code) {
    case 1: // PERMISSION_DENIED
      return "No diste permiso para usar tu ubicación. Elige tu distrito de la lista.";
    case 3: // TIMEOUT
      return "Tu ubicación tardó demasiado. Inténtalo de nuevo o elige tu distrito de la lista.";
    case "unsupported":
      return "Tu navegador no permite usar la ubicación. Elige tu distrito de la lista.";
    default: // 2: POSITION_UNAVAILABLE
      return "No pudimos obtener tu ubicación. Elige tu distrito de la lista.";
  }
}

/** Posición aproximada del dispositivo: basta la precisión de red (un distrito mide kilómetros). */
export function currentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error(geolocationErrorMessage("unsupported")));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(geolocationErrorMessage(err.code))),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  });
}
