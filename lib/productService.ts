import { PrismaProductRepository } from "./repositories/PrismaProductRepository";
import { listCategoriesWithSubcategories } from "./categoryService";
import type { Product } from "./products";

const repository = new PrismaProductRepository();

export async function listProducts(filters?: {
  query?: string;
  categoryId?: string;
  subcategoryId?: string;
  /** Compatibilidad con productos legacy sin categoryId */
  category?: string;
}): Promise<Product[]> {
  let products = await repository.list();

  if (filters?.categoryId) {
    products = products.filter((p) => p.categoryId === filters.categoryId);
  }

  if (filters?.subcategoryId) {
    products = products.filter(
      (p) => p.subcategoryId === filters.subcategoryId
    );
  }

  if (filters?.category && !filters.categoryId) {
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

export async function listProductsByOwnerId(
  ownerId: string
): Promise<Product[]> {
  return repository.listByOwnerId(ownerId);
}

export { listCategoriesWithSubcategories };
