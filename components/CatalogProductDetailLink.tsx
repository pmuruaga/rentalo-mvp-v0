"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export function CatalogProductDetailLink({
  slug,
  children,
  className,
}: {
  slug: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={`/p/${slug}`}
      className={className}
      onClick={() =>
        trackEvent("click_view_product_from_catalog", { product_slug: slug })
      }
    >
      {children}
    </Link>
  );
}
