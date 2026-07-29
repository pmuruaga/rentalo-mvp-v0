import { NextResponse } from "next/server";
import { requireAdminUserId } from "@/lib/admin";
import { getTelegramConfigStatus } from "@/lib/server/telegram";

export async function GET() {
  const auth = await requireAdminUserId();
  if (auth instanceof NextResponse) return auth;

  return NextResponse.json(getTelegramConfigStatus());
}
