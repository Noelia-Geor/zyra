import type { NextConfig } from "next";

// next-pwa solo se activa en producción (build), no en dev con Turbopack
const nextConfig: NextConfig = {
  turbopack: {},
};

export default nextConfig;
