import { NextResponse } from "next/server";
import { requireAdminUserId } from "@/lib/admin";
import {
  buildTelegramMessage,
  sendTelegramAdminNotification,
} from "@/lib/server/telegram";

export async function POST() {
  const auth = await requireAdminUserId();
  if (auth instanceof NextResponse) return auth;

  const text = buildTelegramMessage({
    emoji: "🧪",
    title: "Mensaje de prueba",
    lines: ["La integración con Telegram está funcionando correctamente."],
  });

  const result = await sendTelegramAdminNotification({ text });

  if (result.skipped) {
    return NextResponse.json(
      {
        success: false,
        sent: false,
        error:
          result.error === "notifications disabled"
            ? "Las notificaciones de Telegram están deshabilitadas."
            : "Telegram no está configurado correctamente en el servidor.",
      },
      { status: 400 }
    );
  }

  if (!result.sent) {
    return NextResponse.json(
      {
        success: false,
        sent: false,
        error: "No se pudo enviar el mensaje de prueba.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, sent: true });
}
