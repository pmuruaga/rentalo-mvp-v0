import Link from "next/link";
import Image from "next/image";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { MisPublicacionesLink } from "@/components/nav/MisPublicacionesLink";
import { RentalNavLinks } from "@/components/nav/RentalNavLinks";

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-rentalo.svg"
            alt="Rentalo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <span className="text-xl font-bold text-[var(--brand-primary)]">
            Rentalo
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <nav className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              href="/catalogo"
              className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
            >
              Catálogo
            </Link>
            <MisPublicacionesLink />
            <RentalNavLinks />
          </nav>
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
