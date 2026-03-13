"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminLoginProps {
  onLogin: (key: string) => Promise<void>;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al verificar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h1 className="mb-2 text-2xl font-bold">Admin</h1>
      <p className="mb-6 text-muted-foreground">
        Ingresá la clave de administrador
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="Clave"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          required
          autoFocus
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Verificando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
