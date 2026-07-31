import "server-only";

const TELEGRAM_API_TIMEOUT_MS = 5_000;

export type TelegramNotificationOptions = {
  text: string;
  disableNotification?: boolean;
};

export type TelegramSendResult = {
  sent: boolean;
  skipped?: boolean;
  error?: string;
};

export type TelegramConfigStatus = {
  enabled: boolean;
  configured: boolean;
};

function normalizeEnvValue(value: string): string {
  let normalized = value.trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized;
}

function readEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (raw == null || raw.trim() === "") return undefined;
  return normalizeEnvValue(raw);
}

function isNotificationsEnabled(): boolean {
  const value = readEnv("TELEGRAM_NOTIFICATIONS_ENABLED");
  if (!value) return false;
  return value.toLowerCase() === "true" || value === "1";
}

function getTelegramConfig(): {
  enabled: boolean;
  token: string | undefined;
  chatId: string | undefined;
} {
  return {
    enabled: isNotificationsEnabled(),
    token: readEnv("TELEGRAM_BOT_TOKEN"),
    chatId: readEnv("TELEGRAM_ADMIN_CHAT_ID"),
  };
}

/** Public status for admin UI — never exposes secrets. */
export function getTelegramConfigStatus(): TelegramConfigStatus {
  const { enabled, token, chatId } = getTelegramConfig();
  return {
    enabled,
    configured: Boolean(token && chatId),
  };
}

/**
 * Escapes dynamic values for Telegram HTML parse_mode.
 * App-controlled markup (&lt;b&gt;, etc.) must be added after escaping.
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildTelegramMessage(options: {
  emoji?: string;
  title: string;
  lines?: string[];
}): string {
  const heading = options.emoji
    ? `${options.emoji} <b>${escapeHtml(options.title)}</b>`
    : `<b>${escapeHtml(options.title)}</b>`;

  const parts = ["🔔 <b>Rentalo</b>", "", heading];

  if (options.lines?.length) {
    parts.push("");
    for (const line of options.lines) {
      parts.push(line);
    }
  }

  return parts.join("\n");
}

/** Base pública normalizada (sin slash final). Null si APP_URL no está definida. */
export function getPublicAppUrl(): string | null {
  const raw = readEnv("APP_URL");
  if (!raw) return null;
  const normalized = raw.replace(/\/+$/, "");
  return normalized || null;
}

/** Construye una URL pública absoluta, o null si APP_URL no está configurada. */
export function buildPublicUrl(path: string): string | null {
  const base = getPublicAppUrl();
  if (!base) return null;
  return `${base}/${path.replace(/^\/+/, "")}`;
}

export function formatArgentinaDateTime(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${part("day")}/${part("month")}/${part("year")} ${part("hour")}:${part("minute")}`;
}

export function getEnvironmentLabel(): string {
  switch (process.env.VERCEL_ENV) {
    case "production":
      return "Producción";
    case "preview":
      return "Preview";
    default:
      return "Desarrollo";
  }
}

function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "AbortError") return "timeout";
    return error.message.slice(0, 120);
  }
  return "unknown error";
}

/**
 * Sends an admin notification via Telegram Bot API.
 * Never throws — failures return { sent: false, error }.
 */
export async function sendTelegramAdminNotification(
  options: TelegramNotificationOptions
): Promise<TelegramSendResult> {
  const { enabled, token, chatId } = getTelegramConfig();

  if (!enabled) {
    console.log("[telegram] notifications disabled");
    return { sent: false, skipped: true, error: "notifications disabled" };
  }

  if (!token || !chatId) {
    console.log("[telegram] configuration missing");
    return { sent: false, skipped: true, error: "configuration missing" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TELEGRAM_API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: options.text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          disable_notification: options.disableNotification ?? false,
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      console.error(`[telegram] send failed: HTTP ${response.status}`);
      return {
        sent: false,
        error: `HTTP ${response.status}`,
      };
    }

    let body: { ok?: boolean; description?: string } | null = null;
    try {
      body = (await response.json()) as { ok?: boolean; description?: string };
    } catch {
      console.error("[telegram] send failed: invalid JSON response");
      return { sent: false, error: "invalid JSON response" };
    }

    if (!body?.ok) {
      const description = body?.description?.slice(0, 80) ?? "ok=false";
      console.error(`[telegram] send failed: ${description}`);
      return { sent: false, error: description };
    }

    console.log("[telegram] notification sent");
    return { sent: true };
  } catch (error) {
    const message = safeErrorMessage(error);
    console.error(`[telegram] send failed: ${message}`);
    return { sent: false, error: message };
  } finally {
    clearTimeout(timeoutId);
  }
}
