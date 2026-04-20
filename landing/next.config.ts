import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.5.1", "192.168.7.36"]
};

export default nextConfig;
