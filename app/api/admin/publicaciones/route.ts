import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUserId } from "@/lib/admin";
import { serializePrismaProduct } from "@/lib/serializePrismaProduct";
import { getProductCategoryLabel } from "@/lib/productCategory";
import { getCategoryFieldsForCreate } from "@/lib/productCategoryResolve";
import { normalizeProductImages } from "@/lib/productImageUrl";
import { isValidEmail, normalizeEmail } from "@/lib/assignedOwnerEmail";
import { resolveAssistedPublicationOwner } from "@/lib/resolveAssistedPublication";

const productInclude = {
  categoryRef: true,
  subcategoryRef: true,
  owner: { select: { name: true, email: true } },
} as const;

function toAdminRow(
  p: Awaited<ReturnType<typeof prisma.product.findMany>>[number] & {
    categoryRef?: { name: string } | null;
    subcategoryRef?: { name: string } | null;
    owner?: { name: string; email: string } | null;
  }
) {
  const serialized = serializePrismaProduct(p);
  return {
    ...serialized,
    categoryLabel: getProductCategoryLabel(serialized),
    ownerName: p.owner?.name ?? null,
    ownerEmail: p.owner?.email ?? null,
  };
}

export async function GET() {
  const auth = await requireAdminUserId();
  if (auth instanceof NextResponse) return auth;

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: productInclude,
  });

  return NextResponse.json(products.map(toAdminRow));
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminUserId();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const assignedOwnerEmailRaw =
    typeof body.assignedOwnerEmail === "string"
      ? body.assignedOwnerEmail.trim()
      : "";

  if (!assignedOwnerEmailRaw) {
    return NextResponse.json(
      { error: "El email del futuro publicador es obligatorio." },
      { status: 400 }
    );
  }

  if (!isValidEmail(assignedOwnerEmailRaw)) {
    return NextResponse.json(
      { error: "El email del futuro publicador no es válido." },
      { status: 400 }
    );
  }

  const images = normalizeProductImages(
    Array.isArray(body.images) ? body.images : []
  );
  const categoryFields = await getCategoryFieldsForCreate(body);
  if ("error" in categoryFields) {
    return NextResponse.json({ error: categoryFields.error }, { status: 400 });
  }

  const ownerResolution = await resolveAssistedPublicationOwner(
    assignedOwnerEmailRaw,
    typeof body.whatsappNumber === "string" ? body.whatsappNumber : null
  );

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
      publishedBy: ownerResolution.publishedBy,
      whatsappNumber: ownerResolution.whatsappNumber,
      deliveryMethod: body.deliveryMethod?.trim() || null,
      condition: body.condition?.trim() || null,
      availabilityNotes: body.availabilityNotes?.trim() || null,
      requirements: body.requirements?.trim() || null,
      minimumRentalPeriod: body.minimumRentalPeriod?.trim() || null,
      importantInfo: body.importantInfo?.trim() || null,
      ownerId: ownerResolution.ownerId,
      assignedOwnerEmail: normalizeEmail(ownerResolution.assignedOwnerEmail),
    },
    include: productInclude,
  });

  return NextResponse.json(toAdminRow(product), { status: 201 });
}
