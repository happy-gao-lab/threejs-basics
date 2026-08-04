import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/threejs-basics",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
