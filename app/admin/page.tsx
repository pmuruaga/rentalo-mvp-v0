"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { Button } from "@/components/ui/button";

const ADMIN_KEY_STORAGE = "rentalo_admin_key";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [key, setKey] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_KEY_STORAGE);
    if (!stored) {
      setIsAuthenticated(false);
      return;
    }
    fetch("/api/admin/products", {
      headers: { "x-admin-key": stored },
    })
      .then((r) => {
        setIsAuthenticated(r.ok);
        if (!r.ok) localStorage.removeItem(ADMIN_KEY_STORAGE);
      })
      .catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem(ADMIN_KEY_STORAGE);
      });
  }, []);

  const handleLogin = async (enteredKey: string) => {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: enteredKey }),
    });
    if (res.ok) {
      localStorage.setItem(ADMIN_KEY_STORAGE, enteredKey);
      setIsAuthenticated(true);
      setKey(enteredKey);
    } else {
      const data = await res.json();
      throw new Error(data.error ?? "Clave incorrecta");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    setIsAuthenticated(false);
  };

  const getAdminKey = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ADMIN_KEY_STORAGE);
    }
    return null;
  };

  if (isAuthenticated === null) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Verificando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Button variant="ghost" asChild>
          <Link href="/">← Volver al sitio</Link>
        </Button>
        <AdminLogin onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/">← Volver al sitio</Link>
        </Button>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
      <AdminPanel adminKey={getAdminKey()!} />
    </div>
  );
}
