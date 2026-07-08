import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/assignedOwnerEmail";
import { getPublisherInfoFromProfile } from "@/lib/publisherInfo";

export type AssistedPublicationOwner = {
  ownerId: string | null;
  assignedOwnerEmail: string;
  publishedBy: string;
  whatsappNumber: string | null;
};

/**
 * Resuelve dueño y datos de publicación para una publicación asistida por admin.
 */
export async function resolveAssistedPublicationOwner(
  assignedOwnerEmail: string,
  adminWhatsapp?: string | null
): Promise<AssistedPublicationOwner> {
  const email = normalizeEmail(assignedOwnerEmail);

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: {
      id: true,
      email: true,
      name: true,
      isBusiness: true,
      businessName: true,
      contactWhatsapp: true,
    },
  });

  if (user) {
    const { publishedBy, whatsappNumber } = getPublisherInfoFromProfile(user);
    return {
      ownerId: user.id,
      assignedOwnerEmail: normalizeEmail(user.email),
      publishedBy,
      whatsappNumber,
    };
  }

  return {
    ownerId: null,
    assignedOwnerEmail: email,
    publishedBy: email,
    whatsappNumber: adminWhatsapp?.trim() || null,
  };
}
