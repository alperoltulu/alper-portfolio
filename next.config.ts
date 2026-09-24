import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint 9 yapılandırma hatalarını build esnasında atlamak için
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
