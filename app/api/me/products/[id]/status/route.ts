import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { ProductStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializePrismaProduct } from "@/lib/serializePrismaProduct";

const productInclude = {
  categoryRef: true,
  subcategoryRef: true,
} as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Tenés que iniciar sesión para continuar." },
      { status: 401 }
    );
  }

  const { id } = await params;

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { ownerId: true, status: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }
  if (existing.ownerId !== session.user.id) {
    return NextResponse.json(
      { error: "No tenés permiso para modificar este producto." },
      { status: 403 }
    );
  }

  if (existing.status === ProductStatus.DISABLED) {
    return NextResponse.json(
      { error: "Esta publicación fue desactivada por administración." },
      { status: 403 }
    );
  }

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const nextStatus =
    body.status === "PAUSED"
      ? ProductStatus.PAUSED
      : body.status === "ACTIVE"
        ? ProductStatus.ACTIVE
        : null;

  if (!nextStatus) {
    return NextResponse.json({ error: "Estado no soportado." }, { status: 400 });
  }

  if (
    nextStatus === ProductStatus.PAUSED &&
    existing.status !== ProductStatus.ACTIVE
  ) {
    return NextResponse.json(
      { error: "Solo podés pausar publicaciones activas." },
      { status: 400 }
    );
  }

  if (
    nextStatus === ProductStatus.ACTIVE &&
    existing.status !== ProductStatus.PAUSED
  ) {
    return NextResponse.json(
      { error: "Solo podés reactivar publicaciones pausadas." },
      { status: 400 }
    );
  }

  const product = await prisma.product.update({
    where: { id },
    data: { status: nextStatus },
    include: productInclude,
  });

  return NextResponse.json(serializePrismaProduct(product));
}
