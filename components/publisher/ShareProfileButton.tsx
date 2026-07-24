"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  url: string;
};

export function ShareProfileButton({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url, text: title });
        return;
      } catch {
        // Usuario canceló o no disponible: fallback a copiar.
      }
    }
    await copyLink();
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full sm:w-auto"
      onClick={() => void handleShare()}
    >
      {copied ? "Enlace copiado" : "Compartir perfil"}
    </Button>
  );
}
