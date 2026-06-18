import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

function safeFilename(name: string): string {
  const sanitized = name
    .trim()
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return sanitized || "image";
}

async function requireUploaderId(): Promise<string | NextResponse> {
  const requestHeaders = await headers();
  const adminKeyHeader = requestHeaders.get("x-admin-key");
  const adminKeyEnv = process.env.ADMIN_KEY;
  if (adminKeyEnv && adminKeyHeader === adminKeyEnv) {
    return "admin";
  }

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Tenés que iniciar sesión para continuar." },
      { status: 401 }
    );
  }
  return session.user.id;
}

export async function POST(request: Request) {
  const uploaderId = await requireUploaderId();
  if (uploaderId instanceof NextResponse) return uploaderId;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "El request debe ser multipart/form-data." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  const productSlug = form.get("productSlug");
  const productId = form.get("productId");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Falta el archivo (field: file)." },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Tipo de imagen inválido. Permitidos: jpeg, png, webp." },
      { status: 400 }
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "La imagen supera el tamaño máximo (5MB)." },
      { status: 400 }
    );
  }

  const identifier =
    (typeof productSlug === "string" && productSlug.trim()) ||
    (typeof productId === "string" && productId.trim()) ||
    uploaderId;

  const productSegment = safePathSegment(identifier);
  const pathname = `products/${productSegment}/${Date.now()}-${safeFilename(file.name)}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Rentalo upload API] error:", message);
    return NextResponse.json(
      { error: "No se pudo subir la imagen.", detail: message },
      { status: 500 }
    );
  }
}
