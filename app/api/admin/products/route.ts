import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  });

  const mapped = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    pricePerDay: p.pricePerDay,
    shortDescription: p.shortDescription,
    description: p.description,
    images: JSON.parse(p.images) as string[],
    whatsappMessageTemplate: p.whatsappMessageTemplate,
    queIncluye: p.queIncluye ? (JSON.parse(p.queIncluye) as string[]) : undefined,
    availableIn: p.availableIn ? (JSON.parse(p.availableIn) as string[]) : [],
    publishedBy: p.publishedBy || undefined,
    whatsappNumber: p.whatsappNumber || undefined,
  }));

  return NextResponse.json(mapped);
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      category: body.category,
      pricePerDay: Number(body.pricePerDay),
      shortDescription: body.shortDescription,
      description: body.description,
      images: JSON.stringify(body.images ?? []),
      whatsappMessageTemplate: body.whatsappMessageTemplate,
      queIncluye: body.queIncluye?.length
        ? JSON.stringify(body.queIncluye)
        : null,
      availableIn: JSON.stringify(body.availableIn ?? []),
      publishedBy: body.publishedBy ?? "",
      whatsappNumber: body.whatsappNumber?.trim() || null,
    },
  });

  return NextResponse.json({
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    pricePerDay: product.pricePerDay,
    shortDescription: product.shortDescription,
    description: product.description,
    images: JSON.parse(product.images) as string[],
    whatsappMessageTemplate: product.whatsappMessageTemplate,
    queIncluye: product.queIncluye
      ? (JSON.parse(product.queIncluye) as string[])
      : undefined,
    availableIn: product.availableIn
      ? (JSON.parse(product.availableIn) as string[])
      : [],
    publishedBy: product.publishedBy || undefined,
    whatsappNumber: product.whatsappNumber || undefined,
  });
}
