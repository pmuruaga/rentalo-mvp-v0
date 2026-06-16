import { prisma } from "@/lib/prisma";
import { parseImagesJson } from "@/lib/serializePrismaProduct";
import type { Product } from "@/lib/products";
import type {
  ProductRepository,
  ProductCreateInput,
} from "./ProductRepository";

const productInclude = {
  categoryRef: true,
  subcategoryRef: true,
} as const;

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId: string | null;
  subcategoryId: string | null;
  pricePerDay: number;
  shortDescription: string;
  description: string;
  images: string;
  whatsappMessageTemplate: string;
  queIncluye: string | null;
  availableIn: string;
  publishedBy: string;
  whatsappNumber: string | null;
  deliveryMethod: string | null;
  condition: string | null;
  availabilityNotes: string | null;
  requirements: string | null;
  minimumRentalPeriod: string | null;
  importantInfo: string | null;
  ownerId: string | null;
  categoryRef?: { name: string } | null;
  subcategoryRef?: { name: string } | null;
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    categoryId: row.categoryId,
    subcategoryId: row.subcategoryId,
    categoryName: row.categoryRef?.name,
    subcategoryName: row.subcategoryRef?.name,
    pricePerDay: row.pricePerDay,
    shortDescription: row.shortDescription,
    description: row.description,
    images: parseImagesJson(row.images),
    whatsappMessageTemplate: row.whatsappMessageTemplate,
    queIncluye: row.queIncluye
      ? (JSON.parse(row.queIncluye) as string[])
      : undefined,
    availableIn: parseJsonArray(row.availableIn),
    publishedBy: row.publishedBy || undefined,
    whatsappNumber: row.whatsappNumber?.trim() || undefined,
    deliveryMethod: row.deliveryMethod?.trim() || undefined,
    condition: row.condition?.trim() || undefined,
    availabilityNotes: row.availabilityNotes?.trim() || undefined,
    requirements: row.requirements?.trim() || undefined,
    minimumRentalPeriod: row.minimumRentalPeriod?.trim() || undefined,
    importantInfo: row.importantInfo?.trim() || undefined,
    ownerId: row.ownerId ?? null,
  };
}

function parseJsonArray(str: string): string[] {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export class PrismaProductRepository implements ProductRepository {
  async list(): Promise<Product[]> {
    const rows = await prisma.product.findMany({
      orderBy: { name: "asc" },
      include: productInclude,
    });
    return rows.map(toProduct);
  }

  async listByOwnerId(ownerId: string): Promise<Product[]> {
    const rows = await prisma.product.findMany({
      where: { ownerId },
      orderBy: { name: "asc" },
      include: productInclude,
    });
    return rows.map(toProduct);
  }

  async getBySlug(slug: string): Promise<Product | null> {
    const row = await prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
    return row ? toProduct(row) : null;
  }

  async getById(id: string): Promise<Product | null> {
    const row = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    return row ? toProduct(row) : null;
  }

  async create(data: ProductCreateInput): Promise<Product> {
    const row = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        category: data.category,
        categoryId: data.categoryId ?? null,
        subcategoryId: data.subcategoryId ?? null,
        pricePerDay: data.pricePerDay,
        shortDescription: data.shortDescription,
        description: data.description,
        images: JSON.stringify(data.images),
        whatsappMessageTemplate: data.whatsappMessageTemplate,
        queIncluye: data.queIncluye
          ? JSON.stringify(data.queIncluye)
          : null,
        availableIn: JSON.stringify(data.availableIn ?? []),
        publishedBy: data.publishedBy ?? "",
        whatsappNumber: data.whatsappNumber?.trim() || null,
        deliveryMethod: data.deliveryMethod?.trim() || null,
        condition: data.condition?.trim() || null,
        availabilityNotes: data.availabilityNotes?.trim() || null,
        requirements: data.requirements?.trim() || null,
        minimumRentalPeriod: data.minimumRentalPeriod?.trim() || null,
        importantInfo: data.importantInfo?.trim() || null,
        ownerId: data.ownerId ?? null,
      },
      include: productInclude,
    });
    return toProduct(row);
  }

  async update(
    id: string,
    data: Partial<ProductCreateInput>
  ): Promise<Product> {
    const updateData: Record<string, unknown> = {};
    if (data.name != null) updateData.name = data.name;
    if (data.slug != null) updateData.slug = data.slug;
    if (data.category != null) updateData.category = data.category;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.subcategoryId !== undefined)
      updateData.subcategoryId = data.subcategoryId;
    if (data.pricePerDay != null) updateData.pricePerDay = data.pricePerDay;
    if (data.shortDescription != null)
      updateData.shortDescription = data.shortDescription;
    if (data.description != null) updateData.description = data.description;
    if (data.images != null) updateData.images = JSON.stringify(data.images);
    if (data.whatsappMessageTemplate != null)
      updateData.whatsappMessageTemplate = data.whatsappMessageTemplate;
    if (data.queIncluye != null)
      updateData.queIncluye = JSON.stringify(data.queIncluye);
    if (data.availableIn != null)
      updateData.availableIn = JSON.stringify(data.availableIn);
    if (data.publishedBy != null) updateData.publishedBy = data.publishedBy;
    if (data.whatsappNumber !== undefined)
      updateData.whatsappNumber = data.whatsappNumber?.trim() || null;
    if (data.deliveryMethod !== undefined)
      updateData.deliveryMethod = data.deliveryMethod?.trim() || null;
    if (data.condition !== undefined)
      updateData.condition = data.condition?.trim() || null;
    if (data.availabilityNotes !== undefined)
      updateData.availabilityNotes = data.availabilityNotes?.trim() || null;
    if (data.requirements !== undefined)
      updateData.requirements = data.requirements?.trim() || null;
    if (data.minimumRentalPeriod !== undefined)
      updateData.minimumRentalPeriod =
        data.minimumRentalPeriod?.trim() || null;
    if (data.importantInfo !== undefined)
      updateData.importantInfo = data.importantInfo?.trim() || null;
    if (data.ownerId !== undefined) updateData.ownerId = data.ownerId;

    const row = await prisma.product.update({
      where: { id },
      data: updateData,
      include: productInclude,
    });
    return toProduct(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }
}
