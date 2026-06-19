import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { ReviewType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canSubmitReview,
  MAX_REVIEW_COMMENT_LENGTH,
  reviewTypeForUser,
  validateReviewComment,
  validateReviewRating,
} from "@/lib/reviews";

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

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  let body: { rentalId?: string; rating?: number; comment?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const rentalId = typeof body.rentalId === "string" ? body.rentalId.trim() : "";
  if (!rentalId) {
    return NextResponse.json({ error: "Falta rentalId." }, { status: 400 });
  }

  if (!validateReviewRating(body.rating)) {
    return NextResponse.json(
      { error: "La calificación debe ser un número entero entre 1 y 5." },
      { status: 400 }
    );
  }

  const comment = validateReviewComment(body.comment);
  if (
    body.comment != null &&
    body.comment !== "" &&
    comment === null &&
    typeof body.comment === "string" &&
    body.comment.trim().length > MAX_REVIEW_COMMENT_LENGTH
  ) {
    return NextResponse.json(
      { error: `El comentario no puede superar ${MAX_REVIEW_COMMENT_LENGTH} caracteres.` },
      { status: 400 }
    );
  }

  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    select: {
      id: true,
      productId: true,
      renterId: true,
      ownerId: true,
      status: true,
    },
  });

  if (!rental) {
    return NextResponse.json({ error: "Alquiler no encontrado." }, { status: 404 });
  }

  const type = reviewTypeForUser(rental, userId);
  if (!type) {
    return NextResponse.json(
      { error: "Solo los participantes del alquiler pueden dejar una calificación." },
      { status: 403 }
    );
  }

  if (!canSubmitReview(rental, userId)) {
    return NextResponse.json(
      { error: "El alquiler no está en el estado correspondiente para calificar." },
      { status: 400 }
    );
  }

  const reviewedUserId =
    type === ReviewType.RENTER_TO_OWNER ? rental.ownerId : rental.renterId;

  const existing = await prisma.review.findUnique({
    where: { rentalId_type: { rentalId, type } },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ya enviaste una calificación para este alquiler." },
      { status: 409 }
    );
  }

  const review = await prisma.review.create({
    data: {
      rentalId,
      reviewerId: userId,
      reviewedUserId,
      productId: rental.productId,
      rating: body.rating,
      comment,
      type,
    },
  });

  return NextResponse.json({
    id: review.id,
    rentalId: review.rentalId,
    rating: review.rating,
    comment: review.comment,
    type: review.type,
    createdAt: review.createdAt.toISOString(),
  });
}
