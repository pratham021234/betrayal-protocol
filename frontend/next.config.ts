import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Prevents double WebSocket mount in development
};

export default nextConfig;
