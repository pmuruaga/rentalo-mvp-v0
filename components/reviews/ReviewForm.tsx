"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/reviews/StarRating";
import { MAX_REVIEW_COMMENT_LENGTH } from "@/lib/reviews";

type Props = {
  rentalId: string;
  targetName: string;
  onSubmitted: () => void;
};

export function ReviewForm({ rentalId, targetName, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (rating < 1) {
      setError("Seleccioná una calificación de 1 a 5 estrellas.");
      return;
    }

    setBusy(true);
    setError(null);

    const res = await fetch("/api/me/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rentalId,
        rating,
        comment: comment.trim() || undefined,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { error?: string };

    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar la calificación.");
      setBusy(false);
      return;
    }

    onSubmitted();
    setBusy(false);
  };

  return (
    <div className="mt-2 space-y-2 rounded-md border bg-muted/20 p-3 text-left">
      <p className="text-sm font-medium">Calificá a {targetName}</p>
      <StarRating value={rating} onChange={setRating} />
      <div className="space-y-1">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, MAX_REVIEW_COMMENT_LENGTH))}
          placeholder="Comentario opcional"
          rows={2}
          className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted-foreground text-right">
          {comment.length}/{MAX_REVIEW_COMMENT_LENGTH}
        </p>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button type="button" size="sm" disabled={busy} onClick={() => void submit()}>
        {busy ? "Enviando…" : "Enviar calificación"}
      </Button>
    </div>
  );
}
