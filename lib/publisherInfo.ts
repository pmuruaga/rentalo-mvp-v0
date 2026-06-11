import { getCurrentUserProfile } from "@/lib/currentUserProfile";

/**
 * Deriva los datos de publicación desde el perfil del usuario autenticado,
 * leyendo siempre datos frescos de la base de datos:
 * - publishedBy: businessName si es empresa, sino name/email.
 * - whatsappNumber: contactWhatsapp del perfil (o null).
 */
export async function getPublisherInfo(): Promise<{
  publishedBy: string;
  whatsappNumber: string | null;
}> {
  const user = await getCurrentUserProfile();
  if (!user) return { publishedBy: "", whatsappNumber: null };

  const publishedBy =
    user.isBusiness && user.businessName?.trim()
      ? user.businessName.trim()
      : user.name || user.email;

  return {
    publishedBy,
    whatsappNumber: user.contactWhatsapp?.trim() || null,
  };
}
