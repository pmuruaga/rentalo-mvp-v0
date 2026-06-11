import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentUserProfile } from "@/lib/currentUserProfile";

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
  const user = await getCurrentUserProfile();
  if (!user) {
    return NextResponse.json(
      { error: "Tenés que iniciar sesión para continuar." },
      { status: 401 }
    );
  }
  return NextResponse.json({
    name: user.name,
    email: user.email,
    isBusiness: user.isBusiness,
    businessName: user.businessName,
    contactWhatsapp: user.contactWhatsapp,
  });
}

export async function PATCH(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const isBusiness = Boolean(body.isBusiness);
  const businessName =
    isBusiness && typeof body.businessName === "string"
      ? body.businessName.trim()
      : "";
  const contactWhatsapp =
    typeof body.contactWhatsapp === "string" ? body.contactWhatsapp.trim() : "";

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isBusiness, businessName, contactWhatsapp },
    select: {
      name: true,
      email: true,
      isBusiness: true,
      businessName: true,
      contactWhatsapp: true,
    },
  });

  return NextResponse.json(user);
}
