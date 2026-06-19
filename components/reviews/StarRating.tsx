"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
};

export function StarRating({ value, onChange, readOnly = false, size = "md" }: Props) {
  const iconSize = size === "sm" ? "size-4" : "size-6";

  return (
    <div className="inline-flex items-center gap-0.5" role="group" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const interactive = !readOnly && onChange;

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            aria-label={`${star} estrella${star === 1 ? "" : "s"}`}
            aria-pressed={filled}
            className={cn(
              "rounded p-0.5 transition-colors",
              interactive && "cursor-pointer hover:scale-105",
              readOnly && "cursor-default"
            )}
            onClick={() => onChange?.(star)}
          >
            <Star
              className={cn(
                iconSize,
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
