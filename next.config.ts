import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.hdr": {
        type: "asset",
      },
    },
  },
};

export default nextConfig;
