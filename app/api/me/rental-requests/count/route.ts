import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { RentalStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.rental.count({
    where: { ownerId: session.user.id, status: RentalStatus.REQUESTED },
  });

  return NextResponse.json({ count });
}
