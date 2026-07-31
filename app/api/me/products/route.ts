import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializePrismaProduct } from "@/lib/serializePrismaProduct";
import { getPublisherInfoFromProfile } from "@/lib/publisherInfo";
import { getCategoryFieldsForCreate } from "@/lib/productCategoryResolve";
import { normalizeProductImages } from "@/lib/productImageUrl";
import { getCurrentUserProfile } from "@/lib/currentUserProfile";
import { claimAssignedProductsForUser } from "@/lib/claimAssignedProducts";
import { notifyNewProductPublished } from "@/lib/server/notifications";

const productInclude = {
  categoryRef: true,
  subcategoryRef: true,
} as const;

async function requireUserId(): Promise<string | NextResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Tenés que iniciar sesión para continuar." },
      { status: 401 }
    );
  }
  return session.user.id;
}

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const profile = await getCurrentUserProfile();
  if (profile) {
    await claimAssignedProductsForUser(profile);
  }

  const products = await prisma.product.findMany({
    where: { ownerId: userId },
    orderBy: { name: "asc" },
    include: productInclude,
  });

  return NextResponse.json(products.map(serializePrismaProduct));
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const images = normalizeProductImages(
    Array.isArray(body.images) ? body.images : []
  );
  const categoryFields = await getCategoryFieldsForCreate(body);
  if ("error" in categoryFields) {
    return NextResponse.json({ error: categoryFields.error }, { status: 400 });
  }

  // publishedBy y whatsappNumber siempre se derivan del perfil del usuario,
  // nunca del body.
  const profile = await getCurrentUserProfile();
  const { publishedBy, whatsappNumber } = profile
    ? getPublisherInfoFromProfile(profile)
    : { publishedBy: "", whatsappNumber: null };

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
      publishedBy,
      whatsappNumber,
      deliveryMethod: body.deliveryMethod?.trim() || null,
      condition: body.condition?.trim() || null,
      availabilityNotes: body.availabilityNotes?.trim() || null,
      requirements: body.requirements?.trim() || null,
      minimumRentalPeriod: body.minimumRentalPeriod?.trim() || null,
      importantInfo: body.importantInfo?.trim() || null,
      ownerId: userId,
    },
    include: productInclude,
  });

  const serialized = serializePrismaProduct(product);

  // Notificación secundaria: ya se persistió el producto y nunca puede fallar
  // el alta desde acá.
  await notifyNewProductPublished({
    product: serialized,
    owner: profile,
    assistedByAdmin: false,
  });

  return NextResponse.json(serialized);
}
