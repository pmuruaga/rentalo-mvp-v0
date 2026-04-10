"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function ProductViewTracker({
  productSlug,
  productName,
}: {
  productSlug: string;
  productName: string;
}) {
  useEffect(() => {
    trackEvent("view_product_detail", {
      product_slug: productSlug,
      product_name: productName,
    });
  }, [productSlug, productName]);

  return null;
}
