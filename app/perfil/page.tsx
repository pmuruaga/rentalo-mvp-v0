import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/currentUserProfile";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { PublicadorCard } from "@/components/publisher/PublicadorCard";
import { getPublisherPublicProfile } from "@/lib/publisherPublic";

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

  const publisher = await getPublisherPublicProfile(user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--brand-primary)]">
        Mi perfil
      </h1>

      {publisher ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Así te ven quienes alquilan
          </h2>
          <PublicadorCard publisher={publisher} />
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Datos de la cuenta</h2>
        <ProfileForm
          name={user.name}
          email={user.email}
          initialIsBusiness={user.isBusiness}
          initialBusinessName={user.businessName ?? ""}
          initialContactWhatsapp={user.contactWhatsapp ?? ""}
        />
      </section>
    </div>
  );
}
