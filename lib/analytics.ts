/**
 * Google Analytics 4 (gtag.js) — helpers mínimos, sin dependencias extra.
 * Si no hay NEXT_PUBLIC_GA_ID (ni legado NEXT_PUBLIC_GA_MEASUREMENT_ID), todo es no-op.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function getGaId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
}

export function isGaConfigured(): boolean {
  return Boolean(getGaId());
}

export function trackEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !getGaId()) return;
  window.gtag?.("event", name, params);
}

/** Para navegación cliente (App Router); el script inicial usa send_page_view: false. */
export function trackPageView(pathWithQuery: string): void {
  if (typeof window === "undefined" || !getGaId()) return;
  window.gtag?.("event", "page_view", {
    page_path: pathWithQuery,
    page_location: window.location.href,
    page_title: document.title,
  });
}
