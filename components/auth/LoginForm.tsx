"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: signError } = await authClient.signIn.email({
        email,
        password,
      });
      if (signError) {
        setError(signError.message ?? "No se pudo iniciar sesión.");
        return;
      }
      const next = safeCallbackUrl(searchParams.get("callbackUrl"));
      router.push(next);
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
        <label htmlFor="login-email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="login-password" className="text-sm font-medium">
          Contraseña
        </label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Ingresando…" : "Ingresar"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link
          href="/registro"
          className="font-medium text-[var(--brand-primary)] hover:underline"
        >
          Registrate
        </Link>
      </p>
    </form>
  );
}
