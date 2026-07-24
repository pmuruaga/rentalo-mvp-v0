import Link from "next/link";
import { StarRating } from "@/components/reviews/StarRating";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { ShareProfileButton } from "@/components/publisher/ShareProfileButton";
import {
  formatMemberSince,
  type PublisherPublicProfile,
} from "@/lib/publisherPublic";

type Props = {
  publisher: PublisherPublicProfile;
  shareUrl: string;
  isOwnProfile: boolean;
};

export function ProfileHeader({
  publisher,
  shareUrl,
  isOwnProfile,
}: Props) {
  const hasReviews =
    publisher.ratingCount > 0 && publisher.ratingAverage != null;
  const accountLabel = publisher.isBusiness
    ? "Empresa / Emprendimiento"
    : "Particular";

  return (
    <header className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <UserAvatar
          imageUrl={publisher.image}
          displayName={publisher.displayName}
          isBusiness={publisher.isBusiness}
          size="xl"
          className="mx-auto sm:mx-0"
        />

        <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {publisher.displayName}
              </h1>
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {accountLabel}
              </span>
            </div>

            {hasReviews ? (
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:justify-start">
                <StarRating
                  value={Math.round(publisher.ratingAverage!)}
                  readOnly
                  size="sm"
                />
                <span className="font-semibold tabular-nums">
                  {publisher.ratingAverage!.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  · {publisher.ratingCount}{" "}
                  {publisher.ratingCount === 1 ? "opinión" : "opiniones"}
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
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {publisher.whatsappUrl ? (
              <Button asChild className="w-full sm:w-auto">
                <a
                  href={publisher.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Consultar por WhatsApp
                </a>
              </Button>
            ) : null}
            <ShareProfileButton
              title={`${publisher.displayName} en Rentalo`}
              url={shareUrl}
            />
            {isOwnProfile ? (
              <Button
                asChild
                variant="ghost"
                className="w-full sm:w-auto"
              >
                <Link href="/perfil">Editar perfil</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
