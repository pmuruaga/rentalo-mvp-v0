import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/auth/ProfileForm";

export const metadata: Metadata = {
  title: "Mi perfil",
  description: "Vé y editá los datos de tu cuenta en Rentalo.",
};

export default async function PerfilPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      isBusiness: true,
      businessName: true,
      contactWhatsapp: true,
    },
  });
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-[var(--brand-primary)]">
        Mi perfil
      </h1>
      <ProfileForm
        name={user.name}
        email={user.email}
        initialIsBusiness={user.isBusiness}
        initialBusinessName={user.businessName ?? ""}
        initialContactWhatsapp={user.contactWhatsapp ?? ""}
      />
    </div>
  );
}
