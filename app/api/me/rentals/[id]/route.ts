import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { RentalStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await ctx.params;

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  if (body.action !== "return") {
    return NextResponse.json({ error: "Acción no soportada." }, { status: 400 });
  }

  const rental = await prisma.rental.findUnique({
    where: { id },
    select: { id: true, renterId: true, status: true },
  });

  if (!rental) {
    return NextResponse.json({ error: "Alquiler no encontrado." }, { status: 404 });
  }

  if (rental.renterId !== userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  if (
    rental.status !== RentalStatus.APPROVED &&
    rental.status !== RentalStatus.ACTIVE
  ) {
    return NextResponse.json(
      { error: "Solo podés marcar como devuelto un alquiler aprobado o en curso." },
      { status: 400 }
    );
  }

  const updated = await prisma.rental.update({
    where: { id },
    data: {
      status: RentalStatus.RETURNED,
      returnedAt: new Date(),
    },
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
  });

  return NextResponse.json({
    id: updated.id,
    productId: updated.productId,
    status: updated.status,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    returnedAt: updated.returnedAt?.toISOString() ?? null,
    product: updated.product,
  });
}
