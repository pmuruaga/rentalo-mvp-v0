import type { Product } from "@/lib/products";

export function getProductCategoryLabel(product: Product): string {
  if (product.categoryName && product.subcategoryName) {
    return `${product.categoryName} · ${product.subcategoryName}`;
  }
  if (product.categoryName) return product.categoryName;
  return product.category;
}

export function buildCategoryString(
  categoryName: string,
  subcategoryName: string
): string {
  return `${categoryName} · ${subcategoryName}`;
}
