import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CurrentUserProfile = {
  id: string;
  name: string;
  email: string;
  isBusiness: boolean;
  businessName: string | null;
  contactWhatsapp: string | null;
};

/**
 * Devuelve el perfil del usuario autenticado leyendo SIEMPRE de la base de
 * datos (no de los datos cacheados en la sesión), para evitar valores
 * desactualizados de isBusiness/businessName/contactWhatsapp.
 */
export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      isBusiness: true,
      businessName: true,
      contactWhatsapp: true,
    },
  });
}
