import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUserId } from "@/lib/admin";
import { serializePrismaProduct } from "@/lib/serializePrismaProduct";
import { getProductCategoryLabel } from "@/lib/productCategory";

const productInclude = {
  categoryRef: true,
  subcategoryRef: true,
  owner: { select: { name: true, email: true } },
} as const;

export async function GET() {
  const auth = await requireAdminUserId();
  if (auth instanceof NextResponse) return auth;

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: productInclude,
  });

  return NextResponse.json(
    products.map((p) => {
      const serialized = serializePrismaProduct(p);
      return {
        ...serialized,
        categoryLabel: getProductCategoryLabel(serialized),
        ownerName: p.owner?.name ?? null,
        ownerEmail: p.owner?.email ?? null,
      };
    })
  );
}
