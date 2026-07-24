import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  deleteManagedProfileImage,
  profileImagePathname,
  validateProfileImageFile,
} from "@/lib/profileImage";

export const runtime = "nodejs";

async function requireUserId(): Promise<string | NextResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Tenés que iniciar sesión para continuar." },
      { status: 401 }
    );
  }
  return session.user.id;
}

/**
 * POST multipart/form-data con field "file".
 * Sube a Vercel Blob (profile-images/{userId}/…) y actualiza User.image.
 * Solo el usuario autenticado puede modificar su propia imagen.
 */
export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

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
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Falta el archivo (field: file)." },
      { status: 400 }
    );
  }

  const validation = validateProfileImageFile(file);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Usuario no encontrado." },
      { status: 404 }
    );
  }

  const pathname = profileImagePathname(userId, file.name);
  let blobUrl: string;
  try {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });
    blobUrl = blob.url;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Rentalo profile image upload] error:", message);
    return NextResponse.json(
      { error: "No se pudo subir la imagen.", detail: message },
      { status: 500 }
    );
  }

  const previousUrl = existing.image;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { image: blobUrl },
      select: { image: true },
    });

    // Borrar la anterior solo después de confirmar el update.
    if (previousUrl && previousUrl !== blobUrl) {
      await deleteManagedProfileImage(previousUrl);
    }

    return NextResponse.json({ image: user.image });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Rentalo profile image DB update] error:", message);
    // Evitar huérfano de la imagen recién subida si falla el update.
    await deleteManagedProfileImage(blobUrl);
    return NextResponse.json(
      { error: "No se pudo guardar la imagen de perfil." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: quita User.image y elimina el blob si es de la app.
 */
export async function DELETE() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Usuario no encontrado." },
      { status: 404 }
    );
  }

  const previousUrl = existing.image;

  await prisma.user.update({
    where: { id: userId },
    data: { image: null },
  });

  await deleteManagedProfileImage(previousUrl);

  return NextResponse.json({ image: null });
}
