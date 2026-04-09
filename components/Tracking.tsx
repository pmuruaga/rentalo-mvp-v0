import Script from "next/script";
import { Suspense } from "react";
import { GaPageView } from "@/components/GaPageView";

function gaMeasurementId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
}

/**
 * GA4 vía gtag. Activar con NEXT_PUBLIC_GA_ID=G-XXXXXXXX en .env.local
 * (NEXT_PUBLIC_GA_MEASUREMENT_ID sigue soportado por compatibilidad).
 */
export function Tracking() {
  const gaId = gaMeasurementId();

  if (!gaId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <GaPageView />
      </Suspense>
    </>
  );
}
