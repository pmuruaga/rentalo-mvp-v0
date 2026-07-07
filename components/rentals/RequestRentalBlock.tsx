"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RentalDateFields } from "@/components/rentals/RentalDateFields";
import { validateRentalDateRange } from "@/lib/rentalDates";

type Props = {
  productId: string;
  productSlug: string;
  ownerId: string | null | undefined;
  currentUserId: string | null;
};

export function RequestRentalBlock({
  productId,
  productSlug,
  ownerId,
  currentUserId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const callbackUrl = encodeURIComponent(`/p/${productSlug}`);
  const isOwner = Boolean(
    currentUserId && ownerId && currentUserId === ownerId
  );
  const validation = validateRentalDateRange(dateFrom, dateTo, {
    required: true,
  });
  const canSubmit = validation.valid;

  const handleRequest = async () => {
    if (!canSubmit) return;

    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/me/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, startDate: dateFrom, endDate: dateTo }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar la solicitud.");
        return;
      }
      setMessage("Solicitud enviada. El dueño la verá en «Solicitudes recibidas».");
    } finally {
      setLoading(false);
    }
  };

  if (!ownerId) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Este artículo no tiene dueño en la app; podés coordinar por WhatsApp
        abajo.
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Es tu publicación. Gestioná solicitudes en{" "}
        <Link
          href="/solicitudes-recibidas"
          className="font-medium text-[var(--brand-primary)] underline"
        >
          Solicitudes recibidas
        </Link>
        .
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button asChild>
          <Link href={`/login?callbackUrl=${callbackUrl}`}>
            Iniciá sesión para solicitar alquiler
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RentalDateFields
        dateFrom={dateFrom}
        dateTo={dateTo}
        required
        onChange={({ dateFrom: nextFrom, dateTo: nextTo }) => {
          setDateFrom(nextFrom);
          setDateTo(nextTo);
        }}
      />
      <Button
        type="button"
        onClick={() => void handleRequest()}
        disabled={loading || !canSubmit}
      >
        {loading ? "Enviando…" : "Solicitar alquiler"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        También podés escribir por WhatsApp para coordinar fechas.
      </p>
    </div>
  );
}
