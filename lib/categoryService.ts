import { prisma } from "@/lib/prisma";

export interface SubcategoryOption {
  id: string;
  name: string;
}

export interface CategoryWithSubcategories {
  id: string;
  name: string;
  subcategories: SubcategoryOption[];
}

export async function listCategoriesWithSubcategories(): Promise<
  CategoryWithSubcategories[]
> {
  const rows = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      subcategories: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true },
      },
    },
  });

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    subcategories: c.subcategories,
  }));
}
