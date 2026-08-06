import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
