import type { NextConfig } from "next";

const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "azurebloglearn.blob.core.windows.net",
      },
    ],
  },
};

export default nextConfig;