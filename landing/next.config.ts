import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.5.1", "192.168.7.36"],
  async redirects() { return [{ source: "/install.sh", destination: "https://raw.githubusercontent.com/aelithron/folderharbor/refs/heads/main/server/install.sh", permanent: true }] }
};

export default nextConfig;
