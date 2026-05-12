import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Ingresar",
  description: "Iniciá sesión en Rentalo.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-[var(--brand-primary)]">
        Ingresar
      </h1>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
