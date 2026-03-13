import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { key } = await request.json();

  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return NextResponse.json(
      { error: "Admin no configurado" },
      { status: 500 }
    );
  }

  if (key === adminKey) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
}
