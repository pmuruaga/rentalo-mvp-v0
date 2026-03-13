import { readFileSync } from "fs";
import { join } from "path";
import type { Product } from "@/lib/products";
import type {
  ProductRepository,
  ProductCreateInput,
} from "./ProductRepository";

export class JsonProductRepository implements ProductRepository {
  private products: Product[] = [];

  constructor() {
    const path = join(process.cwd(), "data", "products.json");
    const raw = readFileSync(path, "utf-8");
    this.products = JSON.parse(raw);
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
