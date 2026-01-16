import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    //dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', 
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

