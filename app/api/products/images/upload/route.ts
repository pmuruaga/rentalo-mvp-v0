import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { uploadProductImage } from "@/lib/storage/azureBlob";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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
  console.log("[Rentalo upload API] POST /api/products/images/upload");

  const uploaderId = await requireUploaderId();
  if (uploaderId instanceof NextResponse) return uploaderId;
  console.log("[Rentalo upload API] uploader authenticated");

  let form: FormData;
  try {
    form = await request.formData();
  } catch (err) {
    console.error("[Rentalo upload API] formData parse error:", err);
    return NextResponse.json(
      { error: "El request debe ser multipart/form-data." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  const productSlug = form.get("productSlug");
  const productId = form.get("productId");

  console.log("[Rentalo upload API] archivo recibido:", {
    isFile: file instanceof File,
    name: file instanceof File ? file.name : null,
    type: file instanceof File ? file.type : null,
    size: file instanceof File ? file.size : null,
    productSlug,
    productId,
  });

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Falta el archivo (field: file)." },
      { status: 400 }
    );
  }

  console.log("[Rentalo upload API] validación tipo y tamaño");
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
  console.log("[Rentalo upload API] validación OK");

  const identifier =
    (typeof productSlug === "string" && productSlug.trim()) ||
    (typeof productId === "string" && productId.trim()) ||
    uploaderId;

  console.log("[Rentalo upload API] identifier:", identifier);

  try {
    console.log("[Rentalo upload API] llamando uploadProductImage");
    const url = await uploadProductImage(file, identifier);
    console.log("[Rentalo upload API] URL generada:", url);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[Rentalo upload API] error completo:", err);
    if (err instanceof Error) {
      console.error("[Rentalo upload API] mensaje exacto:", err.message);
      console.error("[Rentalo upload API] stack trace:", err.stack);
    }

    const message = err instanceof Error ? err.message : "Error inesperado";

    if (message.startsWith("Missing env var:")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (message.includes("Invalid image type")) {
      return NextResponse.json(
        { error: "Tipo de imagen inválido. Permitidos: jpeg, png, webp." },
        { status: 400 }
      );
    }
    if (message.includes("Image too large")) {
      return NextResponse.json(
        { error: "La imagen supera el tamaño máximo (5MB)." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

