// Usado en: npm run build (producción)
// En dev usamos next.config.ts sin PWA para mantener Turbopack
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: { disableDevLogs: true },
});

const nextConfig: NextConfig = {};

export default withPWA(nextConfig);
