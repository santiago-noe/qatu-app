"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import type { Feature } from "geojson";
import { Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { circlePolygon } from "@/lib/geo";

type Point = { lat: number; lng: number };

// Teselas de OpenStreetMap (con su atribución). En producción se cambia de proveedor con la
// variable, sin tocar el código (docs/04).
const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = "© colaboradores de OpenStreetMap";
const BRAND = "#b45309";

interface PickupMapProps {
  /** Centro inicial si aún no hay punto (la plaza de la ciudad). */
  center: Point;
  value: Point | null;
  onChange(p: Point): void;
  /** Círculo público ya guardado: lo que verán quienes busquen. */
  publicArea: { center: Point; radiusM: number } | null;
  disabled?: boolean;
}

function areaFeature(area: PickupMapProps["publicArea"]): Feature {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: area ? [circlePolygon(area.center, area.radiusM)] : [] },
  };
}

// Mapa para marcar el punto exacto de recojo (privado). Con teclado: flechas para mover el mapa,
// + y − para acercar, y el botón marca el centro.
export function PickupMap({ center, value, onChange, publicArea, disabled }: PickupMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap>(null);
  const markerRef = useRef<Marker>(null);
  // Los eventos del mapa leen siempre las props actuales.
  const onChangeRef = useRef(onChange);
  const disabledRef = useRef(disabled);
  useEffect(() => {
    onChangeRef.current = onChange;
    disabledRef.current = disabled;
  });
  const initial = useRef({ center: value ?? center, zoom: value ? 16 : 13 });
  // MapLibre se descarga al abrir la sección: hasta entonces el botón no tendría mapa que leer.
  const [ready, setReady] = useState(false);

  // El mapa se crea una vez (MapLibre se carga solo en el navegador).
  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | undefined;
    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !containerRef.current) return;
      map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: { osm: { type: "raster", tiles: [TILE_URL], tileSize: 256, attribution: ATTRIBUTION, maxzoom: 19 } },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center: [initial.current.center.lng, initial.current.center.lat],
        zoom: initial.current.zoom,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      markerRef.current = new maplibregl.Marker({ color: BRAND, draggable: true });
      markerRef.current.on("dragend", () => {
        const p = markerRef.current?.getLngLat();
        if (p) onChangeRef.current({ lat: p.lat, lng: p.lng });
      });
      map.on("click", (e) => {
        if (!disabledRef.current) onChangeRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
      // El mapa se usa ya (marcar el centro, el marcador); el círculo se agrega cuando carga el
      // estilo, sin esperar las teselas (que pueden tardar o no llegar).
      mapRef.current = map;
      setReady(true);
      sync();
      map.on("style.load", () => {
        map?.addSource("public-area", { type: "geojson", data: areaFeature(null) });
        map?.addLayer({ id: "public-area-fill", type: "fill", source: "public-area", paint: { "fill-color": BRAND, "fill-opacity": 0.15 } });
        map?.addLayer({ id: "public-area-line", type: "line", source: "public-area", paint: { "line-color": BRAND, "line-width": 2 } });
        sync();
      });
    })();
    return () => {
      cancelled = true;
      mapRef.current = null;
      map?.remove();
    };
  }, []);

  // Marcador y círculo siguen a las props.
  function sync() {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    if (value) marker.setLngLat([value.lng, value.lat]).addTo(map);
    else marker.remove();
    marker.setDraggable(!disabled);
    if (map.isStyleLoaded()) (map.getSource("public-area") as GeoJSONSource | undefined)?.setData(areaFeature(publicArea));
  }
  useEffect(sync);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        role="region"
        aria-label="Mapa para marcar el punto de recojo"
        className="h-72 w-full overflow-hidden rounded-[var(--radius-control)] border border-line sm:h-80"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !ready}
          onClick={() => {
            const c = mapRef.current?.getCenter();
            if (c) onChange({ lat: c.lat, lng: c.lng });
          }}
        >
          <Crosshair strokeWidth={1.75} aria-hidden />
          Marcar el centro del mapa
        </Button>
        <p className="text-sm text-ink-2" aria-live="polite">
          {value ? `Punto marcado: ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : "Toca el mapa donde entregas la herramienta."}
        </p>
      </div>
    </div>
  );
}
