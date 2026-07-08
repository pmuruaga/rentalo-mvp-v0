import type { Product as PrismaProduct } from "@prisma/client";
import { normalizeProductImages } from "@/lib/productImageUrl";

export function parseImagesJson(raw: string): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return normalizeProductImages(
      parsed.filter((u): u is string => typeof u === "string")
    );
  } catch {
    return [];
  }
}

export type ProductJson = {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  categoryName?: string;
  subcategoryName?: string;
  pricePerDay: number;
  shortDescription: string;
  description: string;
  images: string[];
  whatsappMessageTemplate: string;
  queIncluye?: string[];
  availableIn: string[];
  publishedBy?: string;
  whatsappNumber?: string;
  deliveryMethod?: string;
  condition?: string;
  availabilityNotes?: string;
  requirements?: string;
  minimumRentalPeriod?: string;
  importantInfo?: string;
  ownerId?: string | null;
  assignedOwnerEmail?: string | null;
  status?: string;
};

type PrismaProductWithRelations = PrismaProduct & {
  categoryRef?: { name: string } | null;
  subcategoryRef?: { name: string } | null;
};

export function serializePrismaProduct(p: PrismaProductWithRelations): ProductJson {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId,
    categoryName: p.categoryRef?.name,
    subcategoryName: p.subcategoryRef?.name,
    pricePerDay: p.pricePerDay,
    shortDescription: p.shortDescription,
    description: p.description,
    images: parseImagesJson(p.images),
    whatsappMessageTemplate: p.whatsappMessageTemplate,
    queIncluye: p.queIncluye ? (JSON.parse(p.queIncluye) as string[]) : undefined,
    availableIn: p.availableIn ? (JSON.parse(p.availableIn) as string[]) : [],
    publishedBy: p.publishedBy || undefined,
    whatsappNumber: p.whatsappNumber || undefined,
    deliveryMethod: p.deliveryMethod || undefined,
    condition: p.condition || undefined,
    availabilityNotes: p.availabilityNotes || undefined,
    requirements: p.requirements || undefined,
    minimumRentalPeriod: p.minimumRentalPeriod || undefined,
    importantInfo: p.importantInfo || undefined,
    ownerId: p.ownerId ?? null,
    assignedOwnerEmail: p.assignedOwnerEmail ?? null,
    status: p.status,
  };
}
