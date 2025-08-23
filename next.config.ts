import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/", destination: "/basics", permanent: true },
    ];
  },
  output: 'export',
  basePath: '/cosmere',
  assetPrefix: '/cosmere',

};

export default nextConfig;
