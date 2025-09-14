import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/registry',
        destination: '/',
        permanent: true, // 301 redirect
      },
      {
        source: '/registry/:path*',
        destination: '/',
        permanent: true, // 301 redirect for any subpaths
      },
    ];
  },
};

export default nextConfig;
