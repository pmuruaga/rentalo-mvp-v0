"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function RentalNavLinks() {
  const { data: session, isPending } = authClient.useSession();
  if (isPending || !session?.user) return null;
  return (
    <>
      <Link
        href="/mis-alquileres"
        className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
      >
        Mis alquileres
      </Link>
      <Link
        href="/solicitudes-recibidas"
        className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
      >
        Solicitudes
      </Link>
    </>
  );
}
