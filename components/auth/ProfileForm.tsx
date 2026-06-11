"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProfileFormProps = {
  name: string;
  email: string;
  initialIsBusiness: boolean;
  initialBusinessName: string;
  initialContactWhatsapp: string;
};

export function ProfileForm({
  name,
  email,
  initialIsBusiness,
  initialBusinessName,
  initialContactWhatsapp,
}: ProfileFormProps) {
  const router = useRouter();
  const [isBusiness, setIsBusiness] = useState(initialIsBusiness);
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [contactWhatsapp, setContactWhatsapp] = useState(
    initialContactWhatsapp
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBusiness, businessName, contactWhatsapp }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudieron guardar los cambios.");
        return;
      }
      const data = await res.json();
      setBusinessName(data.businessName ?? "");
      setSuccess(true);
      // Invalida el cache del router para que otras pantallas server-side
      // lean los datos actualizados.
      router.refresh();
    } catch {
      setError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nombre</label>
        <Input type="text" value={name} disabled />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" value={email} disabled />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="profile-is-business"
          type="checkbox"
          className="h-4 w-4 accent-[var(--brand-primary)]"
          checked={isBusiness}
          onChange={(e) => setIsBusiness(e.target.checked)}
        />
        <label htmlFor="profile-is-business" className="text-sm font-medium">
          Es Empresa/Emprendimiento
        </label>
      </div>
      {isBusiness ? (
        <div className="space-y-2">
          <label
            htmlFor="profile-business-name"
            className="text-sm font-medium"
          >
            Razón Social / Nombre Fantasía
          </label>
          <Input
            id="profile-business-name"
            type="text"
            autoComplete="organization"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
      ) : null}
      <div className="space-y-2">
        <label
          htmlFor="profile-contact-whatsapp"
          className="text-sm font-medium"
        >
          Nro. de Contacto / WhatsApp
        </label>
        <Input
          id="profile-contact-whatsapp"
          type="tel"
          autoComplete="tel"
          placeholder="Ej: 3854123456"
          value={contactWhatsapp}
          onChange={(e) => setContactWhatsapp(e.target.value)}
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-green-600" role="status">
          Cambios guardados.
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
