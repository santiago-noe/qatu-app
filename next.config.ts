import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Las pruebas e2e compilan en su propia carpeta: un `next build` en .next rompería
  // el `next dev` que esté corriendo (comparten los manifiestos de rutas).
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
