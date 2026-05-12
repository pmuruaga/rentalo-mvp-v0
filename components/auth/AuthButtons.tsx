"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        …
      </div>
    );
  }

  const user = session?.user;
  if (user) {
    const label = user.name?.trim() || user.email || "Usuario";
    return (
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <span className="max-w-[10rem] truncate text-sm text-muted-foreground sm:max-w-[14rem]">
          {label}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={signingOut}
          onClick={() => void handleSignOut()}
        >
          {signingOut ? "Saliendo…" : "Salir"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Ingresar</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/registro">Registrarse</Link>
      </Button>
    </div>
  );
}
