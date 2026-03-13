import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
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
        <nav>
          <Link
            href="/catalogo"
            className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
          >
            Catálogo
          </Link>
        </nav>
      </div>
    </header>
  );
}
