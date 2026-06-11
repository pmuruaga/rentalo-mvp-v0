import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/currentUserProfile";
import { ProfileForm } from "@/components/auth/ProfileForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi perfil",
  description: "Vé y editá los datos de tu cuenta en Rentalo.",
};

export default async function PerfilPage() {
  const user = await getCurrentUserProfile();
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
