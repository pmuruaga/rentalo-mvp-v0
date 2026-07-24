"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileImageField } from "@/components/auth/ProfileImageField";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBusiness, setIsBusiness] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const displayName =
    (isBusiness && businessName.trim()) || name.trim() || "Usuario";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setLoading(true);
    try {
      const { error: signError } = await authClient.signUp.email({
        name,
        email,
        password,
        isBusiness,
        businessName: isBusiness ? businessName.trim() : "",
        contactWhatsapp: contactWhatsapp.trim(),
      });
      if (signError) {
        setError(signError.message ?? "No se pudo crear la cuenta.");
        return;
      }

      if (pendingImage) {
        try {
          const form = new FormData();
          form.append("file", pendingImage);
          const res = await fetch("/api/me/profile/image", {
            method: "POST",
            body: form,
            credentials: "same-origin",
          });
          if (!res.ok) {
            setWarning(
              "Tu cuenta se creó correctamente, pero no pudimos subir la imagen. Podés agregarla después desde Mi perfil."
            );
            // Breve pausa para que el usuario lea el aviso.
            await new Promise((r) => setTimeout(r, 1800));
          } else {
            await authClient.getSession();
          }
        } catch {
          setWarning(
            "Tu cuenta se creó correctamente, pero no pudimos subir la imagen. Podés agregarla después desde Mi perfil."
          );
          await new Promise((r) => setTimeout(r, 1800));
        }
      }

      router.push("/");
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
        <label htmlFor="register-name" className="text-sm font-medium">
          Nombre
        </label>
        <Input
          id="register-name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="register-email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="register-password" className="text-sm font-medium">
          Contraseña
        </label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Mínimo 8 caracteres.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="register-is-business"
          type="checkbox"
          className="h-4 w-4 accent-[var(--brand-primary)]"
          checked={isBusiness}
          onChange={(e) => setIsBusiness(e.target.checked)}
        />
        <label htmlFor="register-is-business" className="text-sm font-medium">
          Es Empresa/Emprendimiento
        </label>
      </div>
      {isBusiness ? (
        <div className="space-y-2">
          <label
            htmlFor="register-business-name"
            className="text-sm font-medium"
          >
            Razón Social / Nombre Fantasía
          </label>
          <Input
            id="register-business-name"
            type="text"
            autoComplete="organization"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
      ) : null}
      <div className="space-y-2">
        <label
          htmlFor="register-contact-whatsapp"
          className="text-sm font-medium"
        >
          Nro. de Contacto / WhatsApp
        </label>
        <Input
          id="register-contact-whatsapp"
          type="tel"
          autoComplete="tel"
          placeholder="Ej: 3854123456"
          value={contactWhatsapp}
          onChange={(e) => setContactWhatsapp(e.target.value)}
        />
      </div>

      <ProfileImageField
        isBusiness={isBusiness}
        displayName={displayName}
        persist={false}
        onLocalFileChange={setPendingImage}
      />

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {warning ? (
        <p className="text-sm text-amber-700" role="status">
          {warning}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--brand-primary)] hover:underline"
        >
          Ingresá
        </Link>
      </p>
    </form>
  );
}
