import type { PublisherPublicProfile } from "@/lib/publisherPublic";

type Props = {
  publisher: PublisherPublicProfile;
};

type Stat = {
  value: string;
  label: string;
};

export function ProfileStats({ publisher }: Props) {
  const hasReviews =
    publisher.ratingCount > 0 && publisher.ratingAverage != null;

  const stats: Stat[] = [
    {
      value: hasReviews ? publisher.ratingAverage!.toFixed(1) : "—",
      label: "Reputación",
    },
    {
      value: String(publisher.ratingCount),
      label: publisher.ratingCount === 1 ? "Opinión" : "Opiniones",
    },
    {
      value: String(publisher.completedRentalsCount),
      label:
        publisher.completedRentalsCount === 1
          ? "Alquiler completado"
          : "Alquileres completados",
    },
    {
      value: String(publisher.activeListingsCount),
      label:
        publisher.activeListingsCount === 1
          ? "Publicación activa"
          : "Publicaciones activas",
    },
  ];

  return (
    <section aria-label="Resumen de confianza">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card px-4 py-4 text-center shadow-sm"
          >
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
