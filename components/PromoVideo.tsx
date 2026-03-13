"use client";

import { useState } from "react";

const VIDEO_SRC = "/videos/rentalo-promo.mp4";

export function PromoVideo() {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className="flex aspect-[9/16] w-full max-w-[280px] items-center justify-center rounded-xl border-2 border-dashed border-[var(--brand-secondary)]/60 bg-[var(--brand-secondary)]/20"
        style={{ aspectRatio: "9/16" }}
      >
        <p className="px-4 text-center text-sm text-muted-foreground">
          Video próximamente
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-xl border border-[var(--brand-secondary)]/40 shadow-lg">
      <video
        className="aspect-[9/16] w-full object-cover"
        src={VIDEO_SRC}
        controls
        playsInline
        onError={() => setError(true)}
      >
        Tu navegador no soporta la reproducción de video.
      </video>
    </div>
  );
}
