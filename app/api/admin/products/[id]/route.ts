import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializePrismaProduct } from "@/lib/serializePrismaProduct";
import { getCategoryFieldsForUpdate } from "@/lib/productCategoryResolve";

const productInclude = {
  categoryRef: true,
  subcategoryRef: true,
} as const;

function requireAuth(request: NextRequest): NextResponse | null {
  const key = request.headers.get("x-admin-key");
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey || key !== adminKey) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth) return auth;

  const { id } = await params;
  const body = await request.json();

  const categoryFields = await getCategoryFieldsForUpdate(body);
  if ("error" in categoryFields) {
    return NextResponse.json({ error: categoryFields.error }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (body.name != null) updateData.name = body.name;
  if (body.slug != null) updateData.slug = body.slug;
  if (categoryFields.category != null) updateData.category = categoryFields.category;
  if (categoryFields.categoryId !== undefined)
    updateData.categoryId = categoryFields.categoryId;
  if (categoryFields.subcategoryId !== undefined)
    updateData.subcategoryId = categoryFields.subcategoryId;
  if (body.pricePerDay != null) updateData.pricePerDay = Number(body.pricePerDay);
  if (body.shortDescription != null)
    updateData.shortDescription = body.shortDescription;
  if (body.description != null) updateData.description = body.description;
  if (body.images != null) {
    const images = Array.isArray(body.images) ? body.images.slice(0, 10) : [];
    updateData.images = JSON.stringify(images);
  }
  if (body.whatsappMessageTemplate != null)
    updateData.whatsappMessageTemplate = body.whatsappMessageTemplate;
  if (body.queIncluye != null)
    updateData.queIncluye =
      body.queIncluye?.length > 0 ? JSON.stringify(body.queIncluye) : null;
  if (body.availableIn != null)
    updateData.availableIn = JSON.stringify(body.availableIn ?? []);
  if (body.publishedBy != null) updateData.publishedBy = body.publishedBy ?? "";
  if (body.deliveryMethod !== undefined)
    updateData.deliveryMethod = body.deliveryMethod?.trim() || null;
  if (body.condition !== undefined)
    updateData.condition = body.condition?.trim() || null;
  if (body.availabilityNotes !== undefined)
    updateData.availabilityNotes = body.availabilityNotes?.trim() || null;
  if (body.requirements !== undefined)
    updateData.requirements = body.requirements?.trim() || null;
  if (body.minimumRentalPeriod !== undefined)
    updateData.minimumRentalPeriod =
      body.minimumRentalPeriod?.trim() || null;
  if (body.importantInfo !== undefined)
    updateData.importantInfo = body.importantInfo?.trim() || null;

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: productInclude,
  });

  return NextResponse.json(serializePrismaProduct(product));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth) return auth;

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
