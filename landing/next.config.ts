import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["spaces.hackclub.com"],
  async redirects() { return [{ source: "/install.sh", destination: "https://raw.githubusercontent.com/aelithron/folderharbor/refs/heads/main/server/install.sh", permanent: true }] }
};

export default nextConfig;
