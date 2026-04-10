"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

/**
 * Dispara eventos cuando el catálogo se muestra con filtros en la URL (GET tras "Buscar").
 * Incluye query y/o category en los params cuando corresponden.
 */
export function CatalogInteractionTracker() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category")?.trim() ?? "";

  useEffect(() => {
    if (query) {
      trackEvent("catalog_search", {
        query,
        ...(category ? { category } : {}),
      });
    }
    if (category) {
      trackEvent("catalog_filter_category", {
        category,
        ...(query ? { query } : {}),
      });
    }
  }, [query, category]);

  return null;
}
