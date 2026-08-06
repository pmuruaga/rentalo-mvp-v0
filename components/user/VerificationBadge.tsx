import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserBadge } from "@/lib/userBadges";
import { getUserBadges } from "@/lib/userBadges";

type VerificationBadgeProps = {
  badge: UserBadge;
  className?: string;
  /** Tamaño del ícono en px (default 14). */
  size?: number;
};

/**
 * Ícono discreto de verificación (estilo Airbnb / GitHub).
 * Solo renderiza si se le pasa un badge de verificación.
 */
export function VerificationBadge({
  badge,
  className,
  size = 14,
}: VerificationBadgeProps) {
  if (badge.kind !== "verification") return null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center text-[var(--brand-primary)]",
        className
      )}
      title={badge.label}
      aria-label={badge.label}
    >
      <BadgeCheck
        className="fill-[var(--brand-primary)]/15"
        style={{ width: size, height: size }}
        aria-hidden
      />
    </span>
  );
}

type UserBadgesProps = {
  badges: UserBadge[];
  className?: string;
  size?: number;
};

/** Renderiza todos los badges de un usuario (hoy solo verificación). */
export function UserBadges({ badges, className, size }: UserBadgesProps) {
  if (badges.length === 0) return null;

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {badges.map((badge) => (
        <VerificationBadge key={badge.id} badge={badge} size={size} />
      ))}
    </span>
  );
}

type UserNameWithBadgesProps = {
  name: string;
  verificationStatus?: string | null;
  className?: string;
  nameClassName?: string;
  badgeSize?: number;
  as?: "span" | "p" | "h1" | "h2" | "h3";
};

/**
 * Nombre + badges. Usar en perfiles, cards y listados para no duplicar lógica.
 */
export function UserNameWithBadges({
  name,
  verificationStatus,
  className,
  nameClassName,
  badgeSize,
  as: Tag = "span",
}: UserNameWithBadgesProps) {
  const badges = getUserBadges({ verificationStatus });

  return (
    <Tag className={cn("inline-flex max-w-full items-center gap-1", className)}>
      <span className={cn("truncate", nameClassName)}>{name}</span>
      <UserBadges badges={badges} size={badgeSize} />
    </Tag>
  );
}
