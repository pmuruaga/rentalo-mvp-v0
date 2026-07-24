import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { EmptyState } from "@/components/publisher/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getProductCategoryLabel } from "@/lib/productCategory";
import type { Product } from "@/lib/products";

type Props = {
  displayName: string;
  listings: Product[];
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

export function ProfileListings({ displayName, listings }: Props) {
  const count = listings.length;
  const title =
    count > 0
      ? `Publicaciones de ${displayName} (${count})`
      : `Publicaciones de ${displayName}`;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {count > 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Publicaciones activas disponibles para alquilar.
          </p>
        ) : null}
      </div>

      {count === 0 ? (
        <EmptyState title="Este usuario todavía no tiene publicaciones activas." />
      ) : (
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
              <CardHeader className="space-y-1 pb-2">
                <span className="text-xs font-medium text-[var(--brand-primary)]">
                  {getProductCategoryLabel(p)}
                </span>
                <h3 className="font-semibold leading-snug">{p.name}</h3>
                <p className="text-sm font-medium">
                  {formatPrice(p.pricePerDay)}/día
                </p>
              </CardHeader>
              <CardContent className="flex-1 space-y-1 pb-2">
                {p.availableIn?.length ? (
                  <p className="text-xs text-muted-foreground">
                    Disponible en: {p.availableIn.join(", ")}
                  </p>
                ) : null}
                {p.shortDescription ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {p.shortDescription}
                  </p>
                ) : null}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/p/${p.slug}`}>Ver publicación</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
