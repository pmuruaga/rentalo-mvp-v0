import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializePrismaProduct } from "@/lib/serializePrismaProduct";
import { getPublisherInfo } from "@/lib/publisherInfo";

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

  const products = await prisma.product.findMany({
    where: { ownerId: userId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products.map(serializePrismaProduct));
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const images = Array.isArray(body.images) ? body.images.slice(0, 10) : [];

  // publishedBy y whatsappNumber siempre se derivan del perfil del usuario,
  // nunca del body.
  const { publishedBy, whatsappNumber } = await getPublisherInfo();

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      category: body.category,
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
  });

  return NextResponse.json(serializePrismaProduct(product));
}
