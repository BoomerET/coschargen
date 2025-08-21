import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/", destination: "/basics", permanent: true },
    ];
  },
};

export default nextConfig;
