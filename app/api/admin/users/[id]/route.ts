import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUserId } from "@/lib/admin";
import {
  isUserVerificationStatus,
  USER_VERIFICATION_LABELS,
} from "@/lib/userBadges";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const adminId = await requireAdminUserId();
  if (adminId instanceof NextResponse) return adminId;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const verificationStatus =
    body &&
    typeof body === "object" &&
    "verificationStatus" in body
      ? (body as { verificationStatus: unknown }).verificationStatus
      : undefined;

  if (!isUserVerificationStatus(verificationStatus)) {
    return NextResponse.json(
      {
        error: `verificationStatus inválido. Valores: ${Object.keys(USER_VERIFICATION_LABELS).join(", ")}`,
      },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Usuario no encontrado." },
      { status: 404 }
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { verificationStatus },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isBusiness: true,
      businessName: true,
      verificationStatus: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
  });
}
