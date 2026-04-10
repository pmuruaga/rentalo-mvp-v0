import { Suspense } from "react";
import { listProducts, getCategories } from "@/lib/productService";
import { CatalogInteractionTracker } from "@/components/CatalogInteractionTracker";

export const metadata = {
  title: "Catálogo",
  description:
    "Explorá nuestro catálogo de alquileres para eventos infantiles. Castillos inflables, metegol, karaoke, mesas de dulces y más.",
  openGraph: {
    title: "Catálogo de alquileres | Proyecto 10 alquileres",
    description:
      "Castillos inflables, metegol, karaoke, mesas de dulces y más para tu fiesta.",
  },
};
import { ProductImage } from "@/components/ProductImage";
import { CatalogProductDetailLink } from "@/components/CatalogProductDetailLink";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const products = await listProducts({
    query: params.q,
    category: params.category || undefined,
  });
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={null}>
        <CatalogInteractionTracker />
      </Suspense>
      <h1 className="mb-6 text-2xl font-bold">Catálogo</h1>

      <form method="get" action="/catalogo" className="mb-8 flex flex-wrap gap-4">
        <Input
          type="search"
          name="q"
          placeholder="Buscar por nombre o descripción..."
          defaultValue={params.q}
          className="max-w-xs"
        />
        <select
          name="category"
          defaultValue={params.category ?? ""}
          className="h-9 min-w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {formatCategory(c)}
            </option>
          ))}
        </select>
        <Button type="submit">Buscar</Button>
      </form>

      {products.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-muted/50 p-8 text-center text-muted-foreground">
          No hay productos que coincidan con tu búsqueda. Probá con otros términos o
          elegí otra categoría.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="flex flex-col overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                {p.images?.[0] ? (
                  <ProductImage src={p.images[0]} alt={p.name} />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-muted-foreground"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3ESin imagen%3C/text%3E%3C/svg%3E")`,
                      backgroundSize: "cover",
                    }}
                  />
                )}
              </div>
              <CardHeader className="pb-2">
                <h3 className="font-semibold">{p.name}</h3>
                <span className="mt-1 inline-block w-fit rounded-full bg-[var(--brand-secondary)]/50 px-2 py-0.5 text-xs font-medium text-[var(--brand-primary)]">
                  {formatCategory(p.category)}
                </span>
              </CardHeader>
              <CardContent className="flex-1 space-y-1 pb-2">
                <p className="font-medium">{formatPrice(p.pricePerDay)}/día</p>
                {p.availableIn?.length ? (
                  <p className="text-xs text-muted-foreground">
                    Disponible en: {p.availableIn.join(", ")}
                  </p>
                ) : null}
                {p.publishedBy ? (
                  <p className="text-xs text-muted-foreground">
                    Publicado por {p.publishedBy}
                  </p>
                ) : null}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <CatalogProductDetailLink slug={p.slug}>Ver detalle</CatalogProductDetailLink>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
