import {
  formatMemberSince,
  type PublisherPublicProfile,
} from "@/lib/publisherPublic";

type Props = {
  publisher: PublisherPublicProfile;
};

/**
 * Sin bio ni ubicación en el modelo User: solo tipo de cuenta y antigüedad.
 * No muestra un bloque vacío grande.
 */
export function ProfileAbout({ publisher }: Props) {
  const title = publisher.isBusiness
    ? "Sobre el emprendimiento"
    : "Sobre el publicador";
  const accountType = publisher.isBusiness
    ? "Empresa / Emprendimiento"
    : "Particular";

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tipo de cuenta
            </dt>
            <dd className="mt-1 text-sm text-foreground">{accountType}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              En Rentalo
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatMemberSince(publisher.createdAt)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
