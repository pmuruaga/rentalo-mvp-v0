import { prisma } from "@/lib/prisma";
import { buildCategoryString } from "@/lib/productCategory";

export async function resolveProductCategoryFields(
  categoryId: string,
  subcategoryId: string
): Promise<{
  categoryId: string;
  subcategoryId: string;
  category: string;
  categoryName: string;
  subcategoryName: string;
}> {
  const subcategory = await prisma.subcategory.findUnique({
    where: { id: subcategoryId },
    include: { category: true },
  });

  if (!subcategory || subcategory.categoryId !== categoryId) {
    throw new Error("Categoría o subcategoría inválida.");
  }

  return {
    categoryId,
    subcategoryId,
    category: buildCategoryString(subcategory.category.name, subcategory.name),
    categoryName: subcategory.category.name,
    subcategoryName: subcategory.name,
  };
}

export async function getCategoryFieldsForCreate(body: {
  categoryId?: string;
  subcategoryId?: string;
}): Promise<
  | { categoryId: string; subcategoryId: string; category: string }
  | { error: string }
> {
  if (!body.categoryId || !body.subcategoryId) {
    return { error: "Categoría y subcategoría son obligatorias." };
  }

  try {
    const resolved = await resolveProductCategoryFields(
      body.categoryId,
      body.subcategoryId
    );
    return {
      categoryId: resolved.categoryId,
      subcategoryId: resolved.subcategoryId,
      category: resolved.category,
    };
  } catch {
    return { error: "Categoría o subcategoría inválida." };
  }
}

export async function getCategoryFieldsForUpdate(body: {
  categoryId?: string;
  subcategoryId?: string;
  category?: string;
}): Promise<
  | {
      categoryId?: string | null;
      subcategoryId?: string | null;
      category?: string;
    }
  | { error: string }
> {
  const hasCategoryId = body.categoryId != null;
  const hasSubcategoryId = body.subcategoryId != null;

  if (hasCategoryId !== hasSubcategoryId) {
    return { error: "Categoría y subcategoría deben enviarse juntas." };
  }

  if (!hasCategoryId) {
    return {};
  }

  try {
    const resolved = await resolveProductCategoryFields(
      body.categoryId!,
      body.subcategoryId!
    );
    return {
      categoryId: resolved.categoryId,
      subcategoryId: resolved.subcategoryId,
      category: resolved.category,
    };
  } catch {
    return { error: "Categoría o subcategoría inválida." };
  }
}
