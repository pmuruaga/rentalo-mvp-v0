export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--brand-secondary)]/30 bg-[var(--brand-secondary)]/10">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <p className="text-center text-sm text-muted-foreground">
          <span className="font-semibold text-[var(--brand-primary)]">Rentalo</span>
          {" "}· Compartí tus cosas y hace dinero con ellas.
        </p>
      </div>
    </footer>
  );
}
