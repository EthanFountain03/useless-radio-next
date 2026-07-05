import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async rewrites() {
    // The merch store is a static site in public/store/ — serve its index at /store
    return [{ source: "/store", destination: "/store/index.html" }];
  },
};

export default nextConfig;
