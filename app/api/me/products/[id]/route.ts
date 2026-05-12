import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializePrismaProduct } from "@/lib/serializePrismaProduct";

async function requireOwnerOfProduct(
  productId: string
): Promise<NextResponse | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Tenés que iniciar sesión para continuar." },
      { status: 401 }
    );
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { ownerId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }
  if (existing.ownerId !== session.user.id) {
    return NextResponse.json(
      { error: "No tenés permiso para modificar este producto." },
      { status: 403 }
    );
  }

  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const denied = await requireOwnerOfProduct(id);
  if (denied) return denied;

  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.name != null) updateData.name = body.name;
  if (body.slug != null) updateData.slug = body.slug;
  if (body.category != null) updateData.category = body.category;
  if (body.pricePerDay != null)
    updateData.pricePerDay = Number(body.pricePerDay);
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
  if (body.whatsappNumber !== undefined)
    updateData.whatsappNumber = body.whatsappNumber?.trim() || null;
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
  });

  return NextResponse.json(serializePrismaProduct(product));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const denied = await requireOwnerOfProduct(id);
  if (denied) return denied;

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
