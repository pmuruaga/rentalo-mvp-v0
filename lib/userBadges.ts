import type { UserVerificationStatus } from "@prisma/client";

/**
 * Tipado extensible de badges de usuario.
 * Agregar nuevos kinds acá evita tocar cada pantalla: las UIs consumen `getUserBadges`.
 */
export type UserBadgeKind = "verification";

export type UserBadge = {
  kind: UserBadgeKind;
  /** Identificador estable del badge (ej. VERIFIED_USER). */
  id: string;
  /** Texto corto para accesibilidad / tooltip. */
  label: string;
};

export const USER_VERIFICATION_STATUS_VALUES = [
  "NONE",
  "VERIFIED_USER",
  "VERIFIED_COMPANY",
] as const satisfies readonly UserVerificationStatus[];

export type UserVerificationStatusValue =
  (typeof USER_VERIFICATION_STATUS_VALUES)[number];

export const USER_VERIFICATION_LABELS: Record<
  UserVerificationStatusValue,
  string
> = {
  NONE: "Sin verificar",
  VERIFIED_USER: "Usuario verificado",
  VERIFIED_COMPANY: "Empresa verificada",
};

export function isUserVerificationStatus(
  value: unknown
): value is UserVerificationStatusValue {
  return (
    typeof value === "string" &&
    (USER_VERIFICATION_STATUS_VALUES as readonly string[]).includes(value)
  );
}

export function getVerificationBadge(
  status: UserVerificationStatus | string | null | undefined
): UserBadge | null {
  if (status === "VERIFIED_USER") {
    return {
      kind: "verification",
      id: "VERIFIED_USER",
      label: USER_VERIFICATION_LABELS.VERIFIED_USER,
    };
  }
  if (status === "VERIFIED_COMPANY") {
    return {
      kind: "verification",
      id: "VERIFIED_COMPANY",
      label: USER_VERIFICATION_LABELS.VERIFIED_COMPANY,
    };
  }
  return null;
}

/**
 * Punto único para resolver badges visibles de un usuario.
 * En el futuro: sumar otros kinds sin cambiar las pantallas consumidoras.
 */
export function getUserBadges(user: {
  verificationStatus?: UserVerificationStatus | string | null;
}): UserBadge[] {
  const badges: UserBadge[] = [];
  const verification = getVerificationBadge(user.verificationStatus);
  if (verification) badges.push(verification);
  return badges;
}
