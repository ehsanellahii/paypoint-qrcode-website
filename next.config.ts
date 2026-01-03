import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Placeholder, but make sure to add whatever place you're hosting your images from
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.byonesix.com',
      },
      {
        protocol: 'https',
        hostname: 'gymeyes.ams3.cdn.digitaloceanspaces.com',
      },
    ],
  },
};

export default nextConfig;
