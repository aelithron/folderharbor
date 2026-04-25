import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.7.36', "192.168.5.1"],
  output: "standalone"
};

export default nextConfig;
