import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/productService";
import { getBaseWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppConsultForm } from "@/components/WhatsAppConsultForm";
import { ProductImage } from "@/components/ProductImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { siteName } from "@/lib/site";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | ${siteName}`,
      description: product.shortDescription,
    },
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const baseWhatsAppUrl = getBaseWhatsAppUrl(product.whatsappNumber);
  const hasImages = product.images?.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" asChild>
        <Link href="/catalogo" className="text-[var(--brand-primary)] hover:text-[var(--brand-primary)]/80">
          ← Volver al catálogo
        </Link>
      </Button>

      <article className="mt-6">
        {/* Fotos */}
        {hasImages && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {product.images.map((src, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
              >
                <ProductImage src={src} alt={`${product.name} - foto ${i + 1}`} />
              </div>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <span className="inline-block w-fit rounded-full bg-[var(--brand-secondary)]/50 px-2 py-1 text-sm font-medium text-[var(--brand-primary)]">
              {formatCategory(product.category)}
            </span>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-xl font-semibold">
              {formatPrice(product.pricePerDay)}/día
            </p>
            {(product.availableIn?.length || product.publishedBy) && (
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {product.availableIn?.length ? (
                  <span>Disponible en: {product.availableIn.join(", ")}</span>
                ) : null}
                {product.publishedBy ? (
                  <span>Publicado por {product.publishedBy}</span>
                ) : null}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="font-semibold">Descripción</h2>
              <p className="mt-1 text-muted-foreground">{product.description}</p>
            </div>

            {product.queIncluye && product.queIncluye.length > 0 && (
              <div>
                <h2 className="font-semibold">Qué incluye</h2>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {product.queIncluye.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t pt-6">
              <h2 className="mb-4 font-semibold">Consultar disponibilidad</h2>
              <WhatsAppConsultForm
                productName={product.name}
                baseWhatsAppUrl={baseWhatsAppUrl}
                city={process.env.CITY_DEFAULT ?? "Frías"}
              />
            </div>
          </CardContent>
        </Card>
      </article>
    </div>
  );
}
