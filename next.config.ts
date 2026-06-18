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

const imageRemotePatterns: NonNullable<
  NextConfig["images"]
>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "**.public.blob.vercel-storage.com",
    pathname: "/**",
  },
  ...(azureImagePattern ? [azureImagePattern] : []),
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  images: { remotePatterns: imageRemotePatterns },
};

export default nextConfig;
