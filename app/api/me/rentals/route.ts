import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { RentalStatus, ReviewType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateRentalDateRange } from "@/lib/rentalDates";

const ACTIVE_STATUSES: RentalStatus[] = [
  RentalStatus.REQUESTED,
  RentalStatus.APPROVED,
  RentalStatus.ACTIVE,
];

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
    where: { renterId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      owner: { select: { id: true, name: true } },
      reviews: {
        where: { type: ReviewType.RENTER_TO_OWNER },
        select: { id: true },
        take: 1,
      },
    },
  });

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      returnedAt: r.returnedAt?.toISOString() ?? null,
      product: r.product,
      owner: r.owner,
      hasSubmittedReview: r.reviews.length > 0,
    }))
  );
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  let body: { productId?: string; startDate?: string; endDate?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const productId = typeof body.productId === "string" ? body.productId.trim() : "";
  if (!productId) {
    return NextResponse.json({ error: "Falta productId." }, { status: 400 });
  }

  const startDate =
    typeof body.startDate === "string" ? body.startDate.trim() : "";
  const endDate = typeof body.endDate === "string" ? body.endDate.trim() : "";
  const dateValidation = validateRentalDateRange(startDate, endDate, {
    required: true,
  });
  if (!dateValidation.valid) {
    return NextResponse.json(
      { error: dateValidation.message ?? "Fechas de alquiler inválidas." },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, ownerId: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }

  if (!product.ownerId) {
    return NextResponse.json(
      { error: "Este producto no admite solicitudes por la app." },
      { status: 400 }
    );
  }

  if (product.ownerId === userId) {
    return NextResponse.json(
      { error: "No podés alquilar tu propia publicación." },
      { status: 403 }
    );
  }

  const duplicate = await prisma.rental.findFirst({
    where: {
      productId,
      renterId: userId,
      status: { in: ACTIVE_STATUSES },
    },
  });

  if (duplicate) {
    return NextResponse.json(
      { error: "Ya tenés una solicitud o alquiler activo para este producto." },
      { status: 409 }
    );
  }

  const rental = await prisma.rental.create({
    data: {
      productId,
      renterId: userId,
      ownerId: product.ownerId,
      status: RentalStatus.REQUESTED,
    },
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
  });

  return NextResponse.json({
    id: rental.id,
    productId: rental.productId,
    status: rental.status,
    createdAt: rental.createdAt.toISOString(),
    updatedAt: rental.updatedAt.toISOString(),
    returnedAt: rental.returnedAt?.toISOString() ?? null,
    product: rental.product,
  });
}
