import { RentalStatus, ReviewType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const MAX_REVIEW_COMMENT_LENGTH = 250;

export function validateReviewRating(rating: unknown): rating is number {
  return typeof rating === "number" && Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export function validateReviewComment(comment: unknown): string | null {
  if (comment == null || comment === "") return null;
  if (typeof comment !== "string") return null;
  const trimmed = comment.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_REVIEW_COMMENT_LENGTH) return null;
  return trimmed;
}

export function reviewTypeForUser(
  rental: { renterId: string; ownerId: string },
  userId: string
): ReviewType | null {
  if (rental.renterId === userId) return ReviewType.RENTER_TO_OWNER;
  if (rental.ownerId === userId) return ReviewType.OWNER_TO_RENTER;
  return null;
}

export function canSubmitReview(
  rental: { status: RentalStatus; renterId: string; ownerId: string },
  userId: string
): boolean {
  const type = reviewTypeForUser(rental, userId);
  if (!type) return false;

  if (type === ReviewType.RENTER_TO_OWNER) {
    return (
      rental.status === RentalStatus.RETURNED ||
      rental.status === RentalStatus.RETURN_CONFIRMED
    );
  }

  return rental.status === RentalStatus.RETURN_CONFIRMED;
}

export async function getUserAverageRating(
  userId: string
): Promise<{ average: number; count: number } | null> {
  const agg = await prisma.review.aggregate({
    where: { reviewedUserId: userId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  if (agg._count.rating === 0 || agg._avg.rating == null) return null;

  return {
    average: Math.round(agg._avg.rating * 10) / 10,
    count: agg._count.rating,
  };
}
