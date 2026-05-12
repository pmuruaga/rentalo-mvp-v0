"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function MisPublicacionesLink() {
  const { data: session, isPending } = authClient.useSession();
  if (isPending || !session?.user) return null;
  return (
    <Link
      href="/mis-publicaciones"
      className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
    >
      Mis publicaciones
    </Link>
  );
}
