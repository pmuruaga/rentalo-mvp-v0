import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/assignedOwnerEmail";
import { getPublisherInfoFromProfile } from "@/lib/publisherInfo";

export type ClaimableUserProfile = {
  id: string;
  email: string;
  name: string;
  isBusiness: boolean;
  businessName: string | null;
  contactWhatsapp: string | null;
};

/**
 * Asigna al usuario las publicaciones preasignadas a su email (ownerId null).
 * Solo hace match por email normalizado; un usuario no puede reclamar otro email.
 */
export async function claimAssignedProductsForUser(
  user: ClaimableUserProfile
): Promise<number> {
  const email = normalizeEmail(user.email);
  const { publishedBy, whatsappNumber } = getPublisherInfoFromProfile(user);

  const result = await prisma.product.updateMany({
    where: {
      ownerId: null,
      assignedOwnerEmail: email,
    },
    data: {
      ownerId: user.id,
      publishedBy,
      whatsappNumber,
    },
  });

  return result.count;
}
