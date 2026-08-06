import Link from "next/link";
import { StarRating } from "@/components/reviews/StarRating";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { UserNameWithBadges } from "@/components/user/VerificationBadge";
import { formatMemberSince } from "@/lib/publisherPublic";
import type { PublisherPublicProfile } from "@/lib/publisherPublic";

type Props = {
  publisher: PublisherPublicProfile;
  /** Oculta el botón "Ver perfil" (p. ej. en la página del perfil). */
  hideProfileLink?: boolean;
  /** Tamaño del avatar (lg en vistas destacadas). */
  avatarSize?: "md" | "lg" | "xl";
};

/**
 * Resumen compacto del publicador (detalle de producto / vista previa).
 * El perfil completo vive en /publicador/[id].
 */
export function PublicadorCard({
  publisher,
  hideProfileLink = false,
  avatarSize = "md",
}: Props) {
  const hasReviews =
    publisher.ratingCount > 0 && publisher.ratingAverage != null;
  const accountLabel = publisher.isBusiness
    ? "Empresa / Emprendimiento"
    : "Particular";

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <UserAvatar
            imageUrl={publisher.image}
            displayName={publisher.displayName}
            isBusiness={publisher.isBusiness}
            size={avatarSize === "xl" ? "lg" : avatarSize}
          />

          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <UserNameWithBadges
                as="h2"
                name={publisher.displayName}
                verificationStatus={publisher.verificationStatus}
                badgeSize={16}
                nameClassName="truncate text-lg font-semibold leading-tight"
              />
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {accountLabel}
              </span>
            </div>

            {hasReviews ? (
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                <StarRating
                  value={Math.round(publisher.ratingAverage!)}
                  readOnly
                  size="sm"
                />
                <span className="font-medium tabular-nums">
                  {publisher.ratingAverage!.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({publisher.ratingCount}{" "}
                  {publisher.ratingCount === 1 ? "opinión" : "opiniones"})
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nueva cuenta en Rentalo
              </p>
            )}

            <p className="text-sm text-muted-foreground">
              {formatMemberSince(publisher.createdAt)}
            </p>

            <dl className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5 text-sm text-muted-foreground">
              <div>
                <dt className="sr-only">Alquileres completados</dt>
                <dd>
                  <span className="font-medium tabular-nums text-foreground">
                    {publisher.completedRentalsCount}
                  </span>{" "}
                  {publisher.completedRentalsCount === 1
                    ? "alquiler completado"
                    : "alquileres completados"}
                </dd>
              </div>
              <div>
                <dt className="sr-only">Publicaciones activas</dt>
                <dd>
                  <span className="font-medium tabular-nums text-foreground">
                    {publisher.activeListingsCount}
                  </span>{" "}
                  {publisher.activeListingsCount === 1
                    ? "publicación activa"
                    : "publicaciones activas"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {!hideProfileLink ? (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="shrink-0 self-start"
          >
            <Link href={`/publicador/${publisher.id}`}>Ver perfil</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
