import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/threejs-basics",
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.exr": {
        type: "asset",
      },
      "*.hdr": {
        type: "asset",
      },
    },
  },
};

export default nextConfig;
