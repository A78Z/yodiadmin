import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_GALLERY_PREVIEW: process.env.VERCEL_ENV === "preview" && process.env.VERCEL_GIT_COMMIT_REF === "refonte" ? "1" : "0" },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
