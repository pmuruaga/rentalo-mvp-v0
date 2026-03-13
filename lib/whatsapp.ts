function cleanNumber(number: string): string {
  return number.replace(/\D/g, "");
}

function getDefaultWhatsAppNumber(): string {
  return (
    process.env.WHATSAPP_NUMBER ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""
  );
}

/** URL base para WhatsApp. Si phoneNumber está vacío, usa el número general de Rentalo. */
export function getBaseWhatsAppUrl(phoneNumber?: string | null): string {
  const raw = phoneNumber?.trim() || getDefaultWhatsAppNumber();
  const num = cleanNumber(raw);
  return `https://wa.me/${num}`;
}

export function buildWhatsAppUrl(message: string, phoneNumber?: string | null): string {
  const text = encodeURIComponent(message);
  return `${getBaseWhatsAppUrl(phoneNumber)}?text=${text}`;
}
