import { del } from "@vercel/blob";

/** Campo de perfil: reutiliza User.image (Better Auth). */
export const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export const ALLOWED_PROFILE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const PROFILE_IMAGE_HELP =
  "Formatos JPG, PNG o WebP. Tamaño máximo 5 MB.";

export function safeProfileFilename(name: string): string {
  const sanitized = name
    .trim()
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return sanitized || "image";
}

export function profileImagePathname(userId: string, filename: string): string {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]+/g, "") || "user";
  return `profile-images/${safeUserId}/${Date.now()}-${safeProfileFilename(filename)}`;
}

/** Solo elimina blobs propios de profile-images en Vercel Blob. */
export function isManagedProfileImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const isBlobHost =
      host === "public.blob.vercel-storage.com" ||
      host.endsWith(".public.blob.vercel-storage.com");
    if (!isBlobHost) return false;
    return /\/profile-images\//.test(parsed.pathname);
  } catch {
    return false;
  }
}

/**
 * Intenta borrar una imagen anterior de Vercel Blob.
 * No lanza: registra el error y continúa (no revierte la nueva imagen).
 */
export async function deleteManagedProfileImage(
  url: string | null | undefined
): Promise<void> {
  if (!url || !isManagedProfileImageUrl(url)) return;
  try {
    await del(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      "[Rentalo profile image] no se pudo eliminar blob anterior:",
      message
    );
  }
}

export function validateProfileImageFile(
  file: File
): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_PROFILE_IMAGE_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Tipo de imagen inválido. Permitidos: JPG, PNG o WebP.",
    };
  }
  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    return {
      ok: false,
      error: "La imagen supera el tamaño máximo (5 MB).",
    };
  }
  return { ok: true };
}
