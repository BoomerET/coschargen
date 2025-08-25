import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/", destination: "/basics", permanent: true },
    ];
  },
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/cosmere' : undefined,
  assetPrefix: process.env.NODE_ENV === 'production' ? '/cosmere/' : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
