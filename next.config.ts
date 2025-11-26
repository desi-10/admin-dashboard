import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Turbopack configuration (Next.js 16+)
  turbopack: {
    // Empty config to silence the webpack warning
  },

  // Mark Prisma as external package for server components
  // Moved from experimental.serverComponentsExternalPackages in Next.js 16
  serverExternalPackages: ["@prisma/internals", "prisma"],
};

export default nextConfig;
