import Link from "next/link";
import { StarRating } from "@/components/reviews/StarRating";
import { Button } from "@/components/ui/button";
import { formatMemberSince } from "@/lib/publisherPublic";
import type { PublisherPublicProfile } from "@/lib/publisherPublic";

type Props = {
  publisher: PublisherPublicProfile;
  /** Oculta el botón "Ver perfil" (p. ej. en la página del perfil). */
  hideProfileLink?: boolean;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function PublicadorCard({ publisher, hideProfileLink = false }: Props) {
  const hasReviews = publisher.ratingCount > 0 && publisher.ratingAverage != null;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-muted">
            {publisher.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatares OAuth (dominios variables)
              <img
                src={publisher.image}
                alt={publisher.displayName}
                className="size-full object-cover"
              />
            ) : (
              <span
                className="flex size-full items-center justify-center text-sm font-semibold text-muted-foreground"
                aria-hidden
              >
                {initials(publisher.displayName)}
              </span>
            )}
          </div>

          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold leading-tight">
                {publisher.displayName}
              </h2>
              {publisher.isBusiness ? (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                  🏢 Empresa
                </span>
              ) : null}
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

            <dl className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm text-muted-foreground">
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
          <Button variant="outline" size="sm" asChild className="shrink-0 self-start">
            <Link href={`/publicador/${publisher.id}`}>Ver perfil</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
