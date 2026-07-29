"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type TelegramStatus = {
  enabled: boolean;
  configured: boolean;
};

export function TelegramNotificationsSection() {
  const router = useRouter();
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      setLoadingStatus(true);
      try {
        const res = await fetch("/api/admin/telegram/status", {
          cache: "no-store",
        });
        if (res.status === 401) {
          router.replace("/login?callbackUrl=%2Fadmin%2Fpublicaciones");
          return;
        }
        if (res.status === 403) {
          router.replace("/");
          return;
        }
        if (!res.ok) {
          if (!cancelled) {
            setError("No se pudo cargar el estado de Telegram.");
          }
          return;
        }
        const data = (await res.json()) as TelegramStatus;
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled) {
          setError("No se pudo cargar el estado de Telegram.");
        }
      } finally {
        if (!cancelled) setLoadingStatus(false);
      }
    }

    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const sendTest = async () => {
    setSending(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/telegram/test", { method: "POST" });
      if (res.status === 401) {
        router.replace("/login?callbackUrl=%2Fadmin%2Fpublicaciones");
        return;
      }
      if (res.status === 403) {
        router.replace("/");
        return;
      }
      const data = (await res.json()) as {
        success?: boolean;
        sent?: boolean;
        error?: string;
      };
      if (!res.ok || !data.success) {
        setError(data.error ?? "No se pudo enviar el mensaje de prueba.");
        return;
      }
      setMessage("Mensaje de prueba enviado correctamente.");
    } catch {
      setError("No se pudo enviar el mensaje de prueba.");
    } finally {
      setSending(false);
    }
  };

  const configured = Boolean(status?.configured);
  const statusLabel = loadingStatus
    ? "Cargando…"
    : configured
      ? "Configuradas"
      : "No configuradas";

  return (
    <section className="rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Notificaciones de Telegram</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Estado:{" "}
            <span
              className={
                configured ? "text-green-700 dark:text-green-500" : undefined
              }
            >
              {statusLabel}
            </span>
            {!loadingStatus && status && !status.enabled ? (
              <span className="text-muted-foreground"> · deshabilitadas</span>
            ) : null}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={sending || loadingStatus}
          onClick={() => void sendTest()}
        >
          {sending ? "Enviando…" : "Enviar mensaje de prueba"}
        </Button>
      </div>

      {message ? (
        <p className="mt-3 text-sm text-green-700 dark:text-green-500" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
