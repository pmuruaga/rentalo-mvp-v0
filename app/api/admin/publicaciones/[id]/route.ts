import { NextRequest, NextResponse } from "next/server";
import { ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminUserId } from "@/lib/admin";
import { serializePrismaProduct } from "@/lib/serializePrismaProduct";

const productInclude = {
  categoryRef: true,
  subcategoryRef: true,
} as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUserId();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const nextStatus =
    body.status === "DISABLED"
      ? ProductStatus.DISABLED
      : body.status === "ACTIVE"
        ? ProductStatus.ACTIVE
        : null;

  if (!nextStatus) {
    return NextResponse.json({ error: "Estado no soportado." }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "Publicación no encontrada." },
      { status: 404 }
    );
  }

  const product = await prisma.product.update({
    where: { id },
    data: { status: nextStatus },
    include: productInclude,
  });

  return NextResponse.json(serializePrismaProduct(product));
}
