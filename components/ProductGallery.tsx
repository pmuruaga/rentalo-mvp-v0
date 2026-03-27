"use client";

import { useState } from "react";
import { ProductImage } from "./ProductImage";

const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect fill='%23e5e7eb' width='800' height='500'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3ESin imagen%3C/text%3E%3C/svg%3E";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="mb-8">
        <div
          className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted"
          style={{
            backgroundImage: `url(${PLACEHOLDER_SVG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>
    );
  }

  const safeIndex = Math.min(selectedIndex, images.length - 1);
  const mainSrc = images[safeIndex];

  return (
    <div className="mb-8 space-y-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
        <ProductImage
          src={mainSrc}
          alt={`${productName} - foto ${safeIndex + 1}`}
        />
      </div>

      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                i === safeIndex
                  ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20"
                  : "border-transparent hover:border-muted-foreground/30"
              }`}
              aria-label={`Ver foto ${i + 1}`}
            >
              <ProductImage src={src} alt="" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
