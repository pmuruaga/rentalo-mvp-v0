import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ReceivedRequestsPanel } from "@/components/rentals/ReceivedRequestsPanel";

export const metadata: Metadata = {
  title: "Solicitudes recibidas",
  description: "Solicitudes de alquiler sobre tus publicaciones.",
};

export default async function SolicitudesRecibidasPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fsolicitudes-recibidas");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-[var(--brand-primary)]">
        Solicitudes recibidas
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Personas que quieren alquilar tus productos. Podés aprobar o cancelar
        cada solicitud pendiente.
      </p>
      <ReceivedRequestsPanel />
    </div>
  );
}
