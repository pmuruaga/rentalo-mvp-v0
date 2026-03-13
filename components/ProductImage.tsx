"use client";

import Image from "next/image";
import { useState } from "react";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3ESin imagen%3C/text%3E%3C/svg%3E";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`absolute inset-0 ${className ?? ""}`}
        style={{
          backgroundImage: `url(${PLACEHOLDER})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className ?? ""}`}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      onError={() => setError(true)}
    />
  );
}
