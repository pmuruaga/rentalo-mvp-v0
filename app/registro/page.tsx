import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Registro",
  description: "Creá tu cuenta en Rentalo.",
};

export default function RegistroPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-[var(--brand-primary)]">
        Crear cuenta
      </h1>
      <RegisterForm />
    </div>
  );
}
