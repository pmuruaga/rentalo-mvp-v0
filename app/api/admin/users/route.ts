import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUserId } from "@/lib/admin";

export async function GET() {
  const adminId = await requireAdminUserId();
  if (adminId instanceof NextResponse) return adminId;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
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

  return NextResponse.json(
    users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    }))
  );
}
