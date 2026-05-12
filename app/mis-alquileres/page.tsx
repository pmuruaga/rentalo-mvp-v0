import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MyRentalsPanel } from "@/components/rentals/MyRentalsPanel";

export const metadata: Metadata = {
  title: "Mis alquileres",
  description: "Alquileres que solicitaste en Rentalo.",
};

export default async function MisAlquileresPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fmis-alquileres");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-[var(--brand-primary)]">
        Mis alquileres
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Solicitudes y alquileres donde vos sos quien alquila.
      </p>
      <MyRentalsPanel />
    </div>
  );
}
