"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function AdminLink() {
  const { data: session, isPending } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      setIsAdmin(false);
      return;
    }
    fetch("/api/me/profile", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { role?: string } | null) => {
        setIsAdmin(data?.role === "ADMIN");
      })
      .catch(() => setIsAdmin(false));
  }, [session?.user]);

  if (isPending || !session?.user || !isAdmin) return null;

  return (
    <Link
      href="/admin/publicaciones"
      className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
    >
      Admin
    </Link>
  );
}
