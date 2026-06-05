import "server-only";

import { BlobServiceClient } from "@azure/storage-blob";
import crypto from "node:crypto";

const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function normalizeEnvValue(value: string): string {
  let normalized = value.trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return normalizeEnvValue(value);
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

function accountNameFromConnectionString(connectionString: string): string | null {
  const match = /(?:^|;)AccountName=([^;]+)/i.exec(connectionString);
  return match ? match[1].trim() : null;
}

function getPublicBaseUrl(): string {
  const containerName = trimSlashes(requiredEnv("AZURE_STORAGE_CONTAINER_NAME"));

  const envBase = process.env.AZURE_STORAGE_PUBLIC_BASE_URL;
  if (envBase) {
    const normalized = normalizeEnvValue(envBase).replace(/\/+$/g, "");
    try {
      new URL(normalized);
      return normalized;
    } catch {
      console.warn(
        "[Rentalo upload API] AZURE_STORAGE_PUBLIC_BASE_URL inválida, usando fallback"
      );
    }
  }

  const connectionString = requiredEnv("AZURE_STORAGE_CONNECTION_STRING");
  const accountName = accountNameFromConnectionString(connectionString);
  if (!accountName) {
    throw new Error(
      "Could not extract AccountName from AZURE_STORAGE_CONNECTION_STRING"
    );
  }

  return `https://${accountName}.blob.core.windows.net/${containerName}`;
}

function encodeBlobPath(blobName: string): string {
  return trimSlashes(blobName)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function safePathSegment(value: string): string {
  const trimmed = value.trim();
  const normalized = trimmed.normalize("NFKD");
  const slugLike = normalized
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slugLike || "product";
}

async function getContainerClient() {
  console.log("[Rentalo upload API] creación de BlobServiceClient");
  const connectionString = requiredEnv("AZURE_STORAGE_CONNECTION_STRING");
  const containerName = trimSlashes(requiredEnv("AZURE_STORAGE_CONTAINER_NAME"));

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  console.log("[Rentalo upload API] BlobServiceClient creado");

  console.log("[Rentalo upload API] obtención del container:", containerName);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  console.log("[Rentalo upload API] container listo");
  return containerClient;
}

function publicUrlForBlob(blobName: string): string {
  const baseUrl = getPublicBaseUrl();
  const encodedPath = encodeBlobPath(blobName);
  const publicUrl = `${baseUrl}/${encodedPath}`;

  console.log("[Rentalo upload API] baseUrl normalizada:", baseUrl);
  console.log("[Rentalo upload API] blobName:", blobName);
  console.log("[Rentalo upload API] publicUrl generada:", publicUrl);

  return publicUrl;
}

export async function uploadProductImage(file: File, productSlugOrId: string): Promise<string> {
  if (!file) throw new Error("Missing file");

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Invalid image type. Allowed: image/jpeg, image/png, image/webp");
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error("Image too large. Max 5MB");
  }

  const containerClient = await getContainerClient();

  const productSegment = safePathSegment(productSlugOrId);
  const ext =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "bin";

  const blobName = `products/${productSegment}/${crypto.randomUUID()}.${ext}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const buffer = Buffer.from(await file.arrayBuffer());
  console.log("[Rentalo upload API] uploadBlob:", {
    blobName,
    bytes: buffer.length,
    contentType: file.type,
  });
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: file.type },
  });
  console.log("[Rentalo upload API] uploadBlob OK");

  return publicUrlForBlob(blobName);
}

