"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShareChannel = "native" | "whatsapp" | "copy";

type Props = {
  productName: string;
};

function getShareUrl(): string {
  return window.location.href;
}

function trackProductShared(channel: ShareChannel) {
  trackEvent("product_shared", { channel });
}

function subscribeNever() {
  return () => {};
}

function getCanNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function ProductShareButton({ productName }: Props) {
  const canNativeShare = useSyncExternalStore(
    subscribeNever,
    getCanNativeShare,
    () => false
  );
  const [open, setOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function showCopiedToast() {
    setToastVisible(true);
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
      toastTimerRef.current = null;
    }, 2000);
  }

  async function shareNative() {
    const url = getShareUrl();
    try {
      await navigator.share({
        title: productName,
        text: "Mirá esta publicación en Rentalo",
        url,
      });
      trackProductShared("native");
    } catch (error) {
      // Usuario canceló o el share falló: no forzar fallback.
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  function shareWhatsApp() {
    const url = getShareUrl();
    const message = `Mirá esta publicación en Rentalo 👇\n\n${productName}\n\n${url}`;
    const href = `https://wa.me/?text=${encodeURIComponent(message)}`;
    trackProductShared("whatsapp");
    setOpen(false);
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      trackProductShared("copy");
      setOpen(false);
      showCopiedToast();
    } catch {
      // Clipboard no disponible: silenciar.
    }
  }

  async function handleClick() {
    if (getCanNativeShare()) {
      setOpen(false);
      await shareNative();
      return;
    }
    setOpen((prev) => !prev);
  }

  return (
    <>
      <div ref={rootRef} className="relative shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
          aria-label="Compartir"
          aria-expanded={canNativeShare ? undefined : open}
          aria-haspopup={canNativeShare ? undefined : "menu"}
          onClick={() => void handleClick()}
        >
          <Share2 className="size-4" aria-hidden />
          <span className="hidden sm:inline">Compartir</span>
        </Button>

        {open && !canNativeShare ? (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-1 min-w-[10.5rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          >
            <button
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm",
                "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={shareWhatsApp}
            >
              <WhatsAppIcon className="size-4 shrink-0 text-[#25D366]" />
              WhatsApp
            </button>
            <button
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm",
                "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => void copyLink()}
            >
              <Link2 className="size-4 shrink-0" aria-hidden />
              Copiar enlace
            </button>
          </div>
        ) : null}
      </div>

      <div
        aria-live="polite"
        aria-hidden={!toastVisible}
        className={cn(
          "pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-md bg-foreground px-4 py-2 text-sm text-background shadow-lg transition-all duration-200",
          toastVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0"
        )}
      >
        <span className="inline-flex items-center gap-2">
          <Check className="size-4" aria-hidden />
          Enlace copiado.
        </span>
      </div>
    </>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
