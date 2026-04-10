"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

/**
 * Envía page_view en cada cambio de ruta (incluida la primera tras hidratar).
 * Debe ir dentro de un boundary Suspense (useSearchParams).
 */
export function GaPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.toString();
    const path = q ? `${pathname}?${q}` : pathname;
    trackPageView(path);
  }, [pathname, searchParams]);

  return null;
}
