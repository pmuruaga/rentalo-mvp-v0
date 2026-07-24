"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import {
  PROFILE_IMAGE_HELP,
  validateProfileImageFile,
} from "@/lib/profileImage";

type ProfileImageFieldProps = {
  isBusiness: boolean;
  displayName: string;
  /** Modo edición: URL actual en BD. Omitir en registro. */
  imageUrl?: string | null;
  /** Si true, sube/elimina vía API. Si false, solo selección local. */
  persist?: boolean;
  onLocalFileChange?: (file: File | null) => void;
  onImageUrlChange?: (url: string | null) => void;
};

export function ProfileImageField({
  isBusiness,
  displayName,
  imageUrl = null,
  persist = true,
  onLocalFileChange,
  onImageUrlChange,
}: ProfileImageFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localObjectUrl, setLocalObjectUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localObjectUrl) URL.revokeObjectURL(localObjectUrl);
    };
  }, [localObjectUrl]);

  const previewUrl = localObjectUrl ?? imageUrl;
  const title = isBusiness ? "Logo del emprendimiento" : "Foto de perfil";
  const uploadLabel = previewUrl
    ? isBusiness
      ? "Cambiar logo"
      : "Cambiar foto"
    : isBusiness
      ? "Subir logo"
      : "Subir foto";

  function clearLocalPreview() {
    if (localObjectUrl) {
      URL.revokeObjectURL(localObjectUrl);
      setLocalObjectUrl(null);
    }
    onLocalFileChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function openPicker() {
    setError(null);
    setSuccess(null);
    inputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    setSuccess(null);
    if (!file) return;

    const validation = validateProfileImageFile(file);
    if (!validation.ok) {
      setError(validation.error);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (!persist) {
      if (localObjectUrl) URL.revokeObjectURL(localObjectUrl);
      const objectUrl = URL.createObjectURL(file);
      setLocalObjectUrl(objectUrl);
      onLocalFileChange?.(file);
      return;
    }

    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/me/profile/image", {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => null)) as {
        image?: string | null;
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error ?? "No se pudo subir la imagen.");
        return;
      }
      const next = data?.image ?? null;
      clearLocalPreview();
      onImageUrlChange?.(next);
      setSuccess(isBusiness ? "Logo actualizado." : "Foto actualizada.");
    } catch {
      setError("Ocurrió un error al subir la imagen.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setError(null);
    setSuccess(null);

    if (!persist) {
      clearLocalPreview();
      return;
    }

    if (!previewUrl) return;

    setBusy(true);
    try {
      const res = await fetch("/api/me/profile/image", {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error ?? "No se pudo eliminar la imagen.");
        return;
      }
      clearLocalPreview();
      onImageUrlChange?.(null);
      setSuccess(
        isBusiness ? "Logo eliminado." : "Foto de perfil eliminada."
      );
    } catch {
      setError("Ocurrió un error al eliminar la imagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{PROFILE_IMAGE_HELP}</p>
      </div>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <UserAvatar
          imageUrl={previewUrl}
          displayName={displayName}
          isBusiness={isBusiness}
          size="lg"
        />
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(e) => void handleFileChange(e)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={openPicker}
          >
            {busy && persist ? "Subiendo…" : uploadLabel}
          </Button>
          {previewUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => void handleRemove()}
            >
              {busy && persist ? "Eliminando…" : "Eliminar"}
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-green-600" role="status">
          {success}
        </p>
      ) : null}
    </div>
  );
}
