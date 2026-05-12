import { NextResponse } from "next/server";
import { headers } from "next/headers";
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

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const rows = await prisma.rental.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      renter: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      renterId: r.renterId,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      returnedAt: r.returnedAt?.toISOString() ?? null,
      product: r.product,
      renter: r.renter,
    }))
  );
}
