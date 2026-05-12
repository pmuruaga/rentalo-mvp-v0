import type { Product as PrismaProduct } from "@prisma/client";

export type ProductJson = {
  id: string;
  name: string;
  slug: string;
  category: string;
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
};

export function serializePrismaProduct(p: PrismaProduct): ProductJson {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    pricePerDay: p.pricePerDay,
    shortDescription: p.shortDescription,
    description: p.description,
    images: JSON.parse(p.images) as string[],
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
  };
}
