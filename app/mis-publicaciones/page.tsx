import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MyListingsPanel } from "@/components/mis-publicaciones/MyListingsPanel";

export const metadata: Metadata = {
  title: "Mis publicaciones",
  description: "Gestioná tus publicaciones en Rentalo.",
};

export default async function MisPublicacionesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fmis-publicaciones");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-[var(--brand-primary)]">
        Mis publicaciones
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Solo vos podés editar o eliminar estos productos. El catálogo público
        sigue mostrando todos los productos.
      </p>
      <MyListingsPanel />
    </div>
  );
}
