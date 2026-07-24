function cleanNumber(number: string): string {
  return number.replace(/\D/g, "");
}

function getDefaultWhatsAppNumber(): string {
  return (
    process.env.WHATSAPP_NUMBER ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""
  );
}

/** Digitos limpios si el teléfono parece usable para wa.me; si no, null. */
export function normalizePublicWhatsAppDigits(
  phoneNumber?: string | null
): string | null {
  const num = cleanNumber(phoneNumber?.trim() || "");
  // Mínimo razonable para móviles AR / internacionales cortos.
  if (num.length < 8) return null;
  return num;
}

/** URL base para WhatsApp. Si phoneNumber está vacío, usa el número general de Rentalo. */
export function getBaseWhatsAppUrl(phoneNumber?: string | null): string {
  const raw = phoneNumber?.trim() || getDefaultWhatsAppNumber();
  const num = cleanNumber(raw);
  return `https://wa.me/${num}`;
}

/** URL wa.me solo si el publicador tiene teléfono propio válido (sin fallback de plataforma). */
export function getPublisherWhatsAppUrl(
  phoneNumber?: string | null
): string | null {
  const num = normalizePublicWhatsAppDigits(phoneNumber);
  if (!num) return null;
  return `https://wa.me/${num}`;
}

export function buildWhatsAppUrl(message: string, phoneNumber?: string | null): string {
  const text = encodeURIComponent(message);
  return `${getBaseWhatsAppUrl(phoneNumber)}?text=${text}`;
}
