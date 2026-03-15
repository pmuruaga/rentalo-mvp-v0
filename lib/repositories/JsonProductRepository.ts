import { readFileSync } from "fs";
import { join } from "path";
import type { Product } from "@/lib/products";
import type {
  ProductRepository,
  ProductCreateInput,
} from "./ProductRepository";

function toProduct(raw: Record<string, unknown>): Product {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    category: String(raw.category ?? ""),
    pricePerDay: Number(raw.pricePerDay ?? 0),
    shortDescription: String(raw.shortDescription ?? ""),
    description: String(raw.description ?? ""),
    images: Array.isArray(raw.images) ? raw.images.map(String) : [],
    whatsappMessageTemplate: String(raw.whatsappMessageTemplate ?? ""),
    queIncluye: Array.isArray(raw.queIncluye)
      ? raw.queIncluye.map(String)
      : undefined,
    availableIn: Array.isArray(raw.availableIn)
      ? raw.availableIn.map(String)
      : undefined,
    publishedBy: raw.publishedBy ? String(raw.publishedBy) : undefined,
    whatsappNumber: raw.whatsappNumber ? String(raw.whatsappNumber) : undefined,
  };
}

export class JsonProductRepository implements ProductRepository {
  private products: Product[] = [];

  constructor() {
    const path = join(process.cwd(), "data", "products.json");
    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    this.products = parsed.map(toProduct);
  }

  async list(): Promise<Product[]> {
    return [...this.products];
  }

  async getBySlug(slug: string): Promise<Product | null> {
    return this.products.find((p) => p.slug === slug) ?? null;
  }

  async getById(): Promise<Product | null> {
    throw new Error("JsonProductRepository does not support getById");
  }

  async create(): Promise<Product> {
    throw new Error("JsonProductRepository does not support create");
  }

  async update(): Promise<Product> {
    throw new Error("JsonProductRepository does not support update");
  }

  async delete(): Promise<void> {
    throw new Error("JsonProductRepository does not support delete");
  }
}
