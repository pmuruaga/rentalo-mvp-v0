"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type UserAvatarSize = "sm" | "md" | "lg" | "xl";

type UserAvatarProps = {
  imageUrl?: string | null;
  displayName: string;
  size?: UserAvatarSize;
  isBusiness?: boolean;
  className?: string;
};

const SIZE_CLASS: Record<UserAvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-14 text-sm",
  lg: "size-20 text-lg",
  xl: "size-28 text-2xl",
};

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Avatar circular reutilizable: imagen de perfil/logo o iniciales.
 */
export function UserAvatar({
  imageUrl,
  displayName,
  size = "md",
  isBusiness = false,
  className,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const label = displayName.trim() || (isBusiness ? "Empresa" : "Usuario");
  const showImage = Boolean(imageUrl) && !failed;
  const alt = isBusiness
    ? `Logo de ${label}`
    : `Foto de perfil de ${label}`;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-muted",
        SIZE_CLASS[size],
        className
      )}
      role="img"
      aria-label={alt}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- Blob/OAuth; remotePatterns ya cubren Blob
        <img
          src={imageUrl!}
          alt={alt}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="flex size-full items-center justify-center font-semibold text-muted-foreground"
          aria-hidden
        >
          {getInitials(label)}
        </span>
      )}
    </div>
  );
}
