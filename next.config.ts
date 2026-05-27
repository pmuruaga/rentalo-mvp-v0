import type { NextConfig } from "next";

function getAzureImageRemotePattern():
  | { protocol: "https" | "http"; hostname: string; pathname: string }
  | null {
  const base = process.env.AZURE_STORAGE_PUBLIC_BASE_URL;
  if (!base) return null;
  try {
    const url = new URL(base);
    return {
      protocol: url.protocol === "http:" ? "http" : "https",
      hostname: url.hostname,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const azureImagePattern = getAzureImageRemotePattern();

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  ...(azureImagePattern
    ? { images: { remotePatterns: [azureImagePattern] } }
    : {}),
};

export default nextConfig;
