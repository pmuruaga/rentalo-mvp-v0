/** Normaliza una URL de imagen de producto para uso en UI y almacenamiento. */
export function normalizeProductImageUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const base = process.env.BLOB_PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (base && !trimmed.startsWith("/")) {
    return `${base}/${trimmed.replace(/^\/+/, "")}`;
  }

  return null;
}

export function normalizeProductImages(images: string[]): string[] {
  return images
    .map(normalizeProductImageUrl)
    .filter((url): url is string => url != null)
    .slice(0, 10);
}

/** Para componentes cliente: solo URLs http(s) válidas. */
export function resolveProductImageSrc(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return null;
}
