import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export function isAdminRole(role: string | null | undefined): boolean {
  return role === UserRole.ADMIN;
}

export async function getCurrentUserRole(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role ?? null;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return isAdminRole(role);
}

export async function requireAdminUserId(): Promise<string | NextResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Tenés que iniciar sesión para continuar." },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  return user.id;
}
