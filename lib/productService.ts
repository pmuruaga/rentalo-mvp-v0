import { PrismaProductRepository } from "./repositories/PrismaProductRepository";
import type { Product } from "./products";

const repository = new PrismaProductRepository();

export async function listProducts(filters?: {
  query?: string;
  category?: string;
}): Promise<Product[]> {
  let products = await repository.list();

  if (filters?.category) {
    products = products.filter(
      (p) =>
        p.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }

  if (filters?.query) {
    const q = filters.query.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return repository.getBySlug(slug);
}

const CATEGORY_ORDER = [
  "Eventos Infantiles",
  "Vehículos",
  "Vehículos Utilitarios",
  "Maquinarias Industriales",
  "Maquinarias Agrícolas",
  "Inmuebles",
];

export async function getCategories(): Promise<string[]> {
  const products = await repository.list();
  const seen = new Set(products.map((p) => p.category));
  const ordered = CATEGORY_ORDER.filter((c) => seen.has(c));
  const rest = [...seen].filter((c) => !CATEGORY_ORDER.includes(c)).sort();
  return [...ordered, ...rest];
}
