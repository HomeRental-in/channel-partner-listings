import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.localhost", "localhost", "*.lvh.me", "lvh.me"],
  serverExternalPackages: ["sharp", "@react-pdf/renderer", "@prisma/client"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "**.localhost" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "120mb", allowedOrigins: ["*.localhost:3000", "localhost:3000", "*.lvh.me:3000"] },
  },
};

export default nextConfig;
