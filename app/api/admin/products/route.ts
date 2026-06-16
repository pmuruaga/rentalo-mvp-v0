import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializePrismaProduct } from "@/lib/serializePrismaProduct";
import { getCategoryFieldsForCreate } from "@/lib/productCategoryResolve";

const productInclude = {
  categoryRef: true,
  subcategoryRef: true,
} as const;

function requireAuth(request: NextRequest): string | NextResponse {
  const key = request.headers.get("x-admin-key");
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey || key !== adminKey) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return key;
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: productInclude,
  });

  return NextResponse.json(products.map(serializePrismaProduct));
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const images = Array.isArray(body.images) ? body.images.slice(0, 10) : [];
  const categoryFields = await getCategoryFieldsForCreate(body);
  if ("error" in categoryFields) {
    return NextResponse.json({ error: categoryFields.error }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      category: categoryFields.category,
      categoryId: categoryFields.categoryId,
      subcategoryId: categoryFields.subcategoryId,
      pricePerDay: Number(body.pricePerDay),
      shortDescription: body.shortDescription,
      description: body.description,
      images: JSON.stringify(images),
      whatsappMessageTemplate: body.whatsappMessageTemplate,
      queIncluye: body.queIncluye?.length
        ? JSON.stringify(body.queIncluye)
        : null,
      availableIn: JSON.stringify(body.availableIn ?? []),
      publishedBy: body.publishedBy ?? "",
      whatsappNumber: body.whatsappNumber?.trim() || null,
      deliveryMethod: body.deliveryMethod?.trim() || null,
      condition: body.condition?.trim() || null,
      availabilityNotes: body.availabilityNotes?.trim() || null,
      requirements: body.requirements?.trim() || null,
      minimumRentalPeriod: body.minimumRentalPeriod?.trim() || null,
      importantInfo: body.importantInfo?.trim() || null,
    },
    include: productInclude,
  });

  return NextResponse.json(serializePrismaProduct(product));
}
