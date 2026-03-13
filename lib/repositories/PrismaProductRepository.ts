import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/products";
import type {
  ProductRepository,
  ProductCreateInput,
} from "./ProductRepository";

function toProduct(row: {
  id: string;
  name: string;
  slug: string;
  category: string;
  pricePerDay: number;
  shortDescription: string;
  description: string;
  images: string;
  whatsappMessageTemplate: string;
  queIncluye: string | null;
  availableIn: string;
  publishedBy: string;
  whatsappNumber: string | null;
}): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    pricePerDay: row.pricePerDay,
    shortDescription: row.shortDescription,
    description: row.description,
    images: JSON.parse(row.images) as string[],
    whatsappMessageTemplate: row.whatsappMessageTemplate,
    queIncluye: row.queIncluye
      ? (JSON.parse(row.queIncluye) as string[])
      : undefined,
    availableIn: parseJsonArray(row.availableIn),
    publishedBy: row.publishedBy || undefined,
    whatsappNumber: row.whatsappNumber?.trim() || undefined,
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
    const rows = await prisma.product.findMany({ orderBy: { name: "asc" } });
    return rows.map(toProduct);
  }

  async getBySlug(slug: string): Promise<Product | null> {
    const row = await prisma.product.findUnique({ where: { slug } });
    return row ? toProduct(row) : null;
  }

  async getById(id: string): Promise<Product | null> {
    const row = await prisma.product.findUnique({ where: { id } });
    return row ? toProduct(row) : null;
  }

  async create(data: ProductCreateInput): Promise<Product> {
    const row = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        category: data.category,
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
      },
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

    const row = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    return toProduct(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }
}
