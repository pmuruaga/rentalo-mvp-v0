"use client";

import { useState } from "react";
import { EmptyState } from "@/components/publisher/EmptyState";
import { StarRating } from "@/components/reviews/StarRating";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import type { PublisherReceivedReview } from "@/lib/publisherPublic";

const INITIAL_VISIBLE = 5;

type Props = {
  reviews: PublisherReceivedReview[];
  ratingAverage: number | null;
  ratingCount: number;
};

function formatReviewDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ProfileReviews({
  reviews,
  ratingAverage,
  ratingCount,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasReviews = ratingCount > 0 && ratingAverage != null;
  const visible = expanded ? reviews : reviews.slice(0, INITIAL_VISIBLE);
  const canExpand = reviews.length > INITIAL_VISIBLE;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Opiniones recibidas
        </h2>
        {hasReviews ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <StarRating
              value={Math.round(ratingAverage!)}
              readOnly
              size="sm"
            />
            <span className="font-semibold tabular-nums">
              {ratingAverage!.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              · {ratingCount}{" "}
              {ratingCount === 1 ? "opinión" : "opiniones"}
            </span>
          </div>
        ) : null}
      </div>

      {reviews.length === 0 ? (
        <EmptyState title="Este usuario todavía no recibió opiniones." />
      ) : (
        <>
          <ul className="space-y-3">
            {visible.map((review) => {
              const createdAt =
                typeof review.createdAt === "string"
                  ? new Date(review.createdAt)
                  : review.createdAt;
              return (
                <li
                  key={review.id}
                  className="rounded-xl border bg-card p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar
                        imageUrl={review.reviewerImage}
                        displayName={review.reviewerName}
                        isBusiness={review.reviewerIsBusiness}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {review.reviewerName}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <StarRating
                            value={review.rating}
                            readOnly
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                    <time
                      className="shrink-0 text-xs text-muted-foreground"
                      dateTime={createdAt.toISOString()}
                    >
                      {formatReviewDate(createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Sobre {review.productName}
                  </p>
                  {review.comment ? (
                    <p className="mt-2 text-sm leading-relaxed text-foreground">
                      {review.comment}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {canExpand ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded
                  ? "Ver menos opiniones"
                  : "Ver todas las opiniones"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
