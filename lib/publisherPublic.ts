import { ProductStatus, RentalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUserAverageRating } from "@/lib/reviews";
import { getPublisherInfoFromProfile } from "@/lib/publisherInfo";
import { listProductsByOwnerId } from "@/lib/productService";
import type { Product } from "@/lib/products";

export type PublisherPublicProfile = {
  id: string;
  displayName: string;
  image: string | null;
  isBusiness: boolean;
  createdAt: Date;
  ratingAverage: number | null;
  ratingCount: number;
  completedRentalsCount: number;
  activeListingsCount: number;
};

export type PublisherReceivedReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  reviewerName: string;
  productName: string;
};

/**
 * Resumen público del publicador (solo lectura).
 * No modifica reviews, auth ni rentals.
 */
export async function getPublisherPublicProfile(
  userId: string
): Promise<PublisherPublicProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isBusiness: true,
      businessName: true,
      contactWhatsapp: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  const { publishedBy } = getPublisherInfoFromProfile(user);
  const [rating, completedRentalsCount, activeListingsCount] =
    await Promise.all([
      getUserAverageRating(userId),
      prisma.rental.count({
        where: {
          ownerId: userId,
          status: RentalStatus.RETURN_CONFIRMED,
        },
      }),
      prisma.product.count({
        where: {
          ownerId: userId,
          status: ProductStatus.ACTIVE,
        },
      }),
    ]);

  return {
    id: user.id,
    displayName: publishedBy,
    image: user.image,
    isBusiness: user.isBusiness,
    createdAt: user.createdAt,
    ratingAverage: rating?.average ?? null,
    ratingCount: rating?.count ?? 0,
    completedRentalsCount,
    activeListingsCount,
  };
}

export async function getPublisherActiveListings(
  userId: string
): Promise<Product[]> {
  const products = await listProductsByOwnerId(userId);
  return products.filter((p) => p.status === ProductStatus.ACTIVE);
}

export async function getPublisherReceivedReviews(
  userId: string
): Promise<PublisherReceivedReview[]> {
  const rows = await prisma.review.findMany({
    where: { reviewedUserId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      reviewer: { select: { name: true } },
      product: { select: { name: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    reviewerName: r.reviewer.name,
    productName: r.product.name,
  }));
}

export function formatMemberSince(date: Date): string {
  const raw = date.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
  return `Miembro desde ${capitalized}`;
}
