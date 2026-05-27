import "server-only";

import { BlobServiceClient } from "@azure/storage-blob";
import crypto from "node:crypto";

const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
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
  const connectionString = requiredEnv("AZURE_STORAGE_CONNECTION_STRING");
  const containerName = trimSlashes(requiredEnv("AZURE_STORAGE_CONTAINER_NAME"));

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
}

function publicUrlForBlob(blobName: string): string {
  const base = requiredEnv("AZURE_STORAGE_PUBLIC_BASE_URL").replace(/\/+$/g, "");
  return `${base}/${trimSlashes(blobName)}`;
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
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: file.type },
  });

  return publicUrlForBlob(blobName);
}

