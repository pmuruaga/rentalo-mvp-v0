import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicadorCard } from "@/components/publisher/PublicadorCard";
import { ProductImage } from "@/components/ProductImage";
import { StarRating } from "@/components/reviews/StarRating";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getProductCategoryLabel } from "@/lib/productCategory";
import { siteName } from "@/lib/site";
import {
  getPublisherActiveListings,
  getPublisherPublicProfile,
  getPublisherReceivedReviews,
} from "@/lib/publisherPublic";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatReviewDate(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const publisher = await getPublisherPublicProfile(id);
  if (!publisher) {
    return { title: "Publicador no encontrado" };
  }
  return {
    title: publisher.displayName,
    description: `Perfil de ${publisher.displayName} en ${siteName}`,
  };
}

export default async function PublicadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const publisher = await getPublisherPublicProfile(id);

  if (!publisher) {
    notFound();
  }

  const [listings, reviews] = await Promise.all([
    getPublisherActiveListings(id),
    getPublisherReceivedReviews(id),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
      <Button variant="ghost" asChild>
        <Link
          href="/catalogo"
          className="text-[var(--brand-primary)] hover:text-[var(--brand-primary)]/80"
        >
          ← Volver al catálogo
        </Link>
      </Button>

      <section className="space-y-3">
        <PublicadorCard publisher={publisher} hideProfileLink />
        {!publisher.isBusiness ? (
          <p className="text-sm text-muted-foreground">Particular</p>
        ) : null}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Publicaciones activas</h2>
          <p className="text-sm text-muted-foreground">
            {listings.length === 0
              ? "Este publicador no tiene publicaciones activas por ahora."
              : `${listings.length} ${listings.length === 1 ? "publicación" : "publicaciones"}`}
          </p>
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {listings.map((p) => (
              <Card key={p.id} className="flex flex-col overflow-hidden">
                <div className="relative aspect-[4/3] bg-muted">
                  {p.images?.[0] ? (
                    <ProductImage src={p.images[0]} alt={p.name} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                      Sin imagen
                    </div>
                  )}
                </div>
                <CardHeader className="space-y-1">
                  <span className="text-xs font-medium text-[var(--brand-primary)]">
                    {getProductCategoryLabel(p)}
                  </span>
                  <h3 className="font-semibold leading-snug">{p.name}</h3>
                  <p className="text-sm font-medium">
                    {formatPrice(p.pricePerDay)}/día
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {p.shortDescription}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/p/${p.slug}`}>Ver publicación</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Opiniones recibidas</h2>
          {publisher.ratingCount > 0 && publisher.ratingAverage != null ? (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <StarRating
                value={Math.round(publisher.ratingAverage)}
                readOnly
                size="sm"
              />
              <span className="font-medium tabular-nums">
                {publisher.ratingAverage.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({publisher.ratingCount}{" "}
                {publisher.ratingCount === 1 ? "opinión" : "opiniones"})
              </span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Nueva cuenta en Rentalo
            </p>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-muted/40 p-6 text-sm text-muted-foreground">
            Todavía no hay opiniones para este publicador.
          </p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StarRating value={review.rating} readOnly size="sm" />
                    <span className="text-sm font-medium">
                      {review.reviewerName}
                    </span>
                  </div>
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={review.createdAt.toISOString()}
                  >
                    {formatReviewDate(review.createdAt)}
                  </time>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sobre {review.productName}
                </p>
                {review.comment ? (
                  <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
