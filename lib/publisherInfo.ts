import { prisma } from "@/lib/prisma";

/**
 * Deriva los datos de publicación desde el perfil del usuario:
 * - publishedBy: businessName si es empresa, sino name/email.
 * - whatsappNumber: contactWhatsapp del perfil (o null).
 */
export async function getPublisherInfo(userId: string): Promise<{
  publishedBy: string;
  whatsappNumber: string | null;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      isBusiness: true,
      businessName: true,
      contactWhatsapp: true,
    },
  });
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
