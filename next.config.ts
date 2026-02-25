import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  // Allow aws-sdk v3 packages to be bundled for server routes
  serverExternalPackages: ["@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner"],
};

export default nextConfig;
