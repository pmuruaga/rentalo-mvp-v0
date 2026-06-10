"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function RentalNavLinks() {
  const { data: session, isPending } = authClient.useSession();
  const [pendingCount, setPendingCount] = useState(0);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setPendingCount(0);
      return;
    }
    let cancelled = false;
    void fetch("/api/me/rental-requests/count")
      .then((res) => (res.ok ? res.json() : { count: 0 }))
      .then((data: { count?: number }) => {
        if (!cancelled) setPendingCount(data.count ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-primary)] hover:underline"
      >
        Solicitudes
        {pendingCount > 0 ? (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-primary)] px-1 text-[10px] font-semibold leading-none text-white">
            {pendingCount}
          </span>
        ) : null}
      </Link>
    </>
  );
}
