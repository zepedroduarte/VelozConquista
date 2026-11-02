import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O Azure F1 pode demorar ~30s a "acordar" durante o build
  staticPageGenerationTimeout: 180,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
