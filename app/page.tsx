import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PromoVideo } from "@/components/PromoVideo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata = {
  title: "Inicio",
  description:
    "Rentalo: marketplace de alquileres. Desde objetos para eventos hasta vehículos, maquinaria e inmuebles. Reservá por día o jornada.",
  openGraph: {
    title: "Rentalo - Alquilá lo que necesitás",
    description:
      "Eventos, vehículos, maquinaria, inmuebles. Marketplace de alquileres simple y directo.",
  },
};

const categoriasDestacadas = [
  "Eventos Infantiles",
  "Vehículos",
  "Vehículos Utilitarios",
  "Maquinarias Industriales",
  "Maquinarias Agrícolas",
  "Inmuebles",
];

const pasos = [
  {
    numero: 1,
    titulo: "Elegí lo que necesitás",
    descripcion:
      "Explorá el catálogo: objetos para eventos, vehículos, maquinaria o espacios. Todo en un solo lugar.",
  },
  {
    numero: 2,
    titulo: "Consultá por WhatsApp",
    descripcion:
      "Escribinos con el producto y la fecha tentativa. Te confirmamos disponibilidad y precios.",
  },
  {
    numero: 3,
    titulo: "Reservá y listo",
    descripcion:
      "Coordinamos entrega, retiro o acceso. Vos te enfocás en lo que importa.",
  },
];

const faqs = [
  {
    pregunta: "¿Qué tipo de cosas puedo alquilar?",
    respuesta:
      "De todo: desde objetos para eventos (castillos inflables, metegol, mesas), vehículos (autos, camionetas, minibuses), maquinaria (tractores, retroexcavadoras, cosechadoras), hasta inmuebles (oficinas, galpones). El catálogo muestra todo lo disponible.",
  },
  {
    pregunta: "¿Cómo reservo?",
    respuesta:
      "Escribinos por WhatsApp indicando el producto y la fecha que necesitás. Te confirmamos disponibilidad y coordinamos el alquiler. Simple y directo.",
  },
  {
    pregunta: "¿Cuánto cuesta el envío o la logística?",
    respuesta:
      "Depende del producto y la ubicación. En la consulta por WhatsApp te pasamos el detalle completo del precio.",
  },
  {
    pregunta: "¿Qué formas de pago aceptan?",
    respuesta:
      "Aceptamos efectivo y transferencia. El pago se realiza al momento de la entrega o según acordemos con cada publicador.",
  },
  {
    pregunta: "¿Puedo alquilar por más de un día?",
    respuesta:
      "Sí. Consultanos por el precio para alquileres de varios días, semanas o campañas (en el caso de maquinaria agrícola).",
  },
];

export default function Home() {
  const whatsappHref = buildWhatsAppUrl(
    "Hola, tengo una consulta sobre los alquileres en Rentalo."
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Hero */}
      <section className="mb-20 rounded-2xl bg-[var(--brand-secondary)]/20 px-6 py-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-[var(--brand-primary)] sm:text-5xl">
          Alquilá lo que necesitás
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Desde objetos para eventos hasta vehículos, maquinaria e inmuebles.
          Un solo marketplace para todos tus alquileres.
        </p>
        <Button asChild size="lg">
          <Link href="/catalogo">Explorar catálogo</Link>
        </Button>
      </section>

      {/* Categorías destacadas */}
      <section className="mb-20">
        <h2 className="mb-6 text-2xl font-bold">Categorías</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categoriasDestacadas.map((cat) => (
            <Link
              key={cat}
              href={`/catalogo?category=${encodeURIComponent(cat)}`}
              className="rounded-lg border border-[var(--brand-secondary)]/40 bg-white p-4 font-medium transition hover:border-[var(--brand-primary)]/40 hover:bg-[var(--brand-secondary)]/10"
            >
              {cat}
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/catalogo">Ver todo el catálogo</Link>
          </Button>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mb-20">
        <h2 className="mb-8 text-2xl font-bold">Cómo funciona</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {pasos.map((paso) => (
            <div
              key={paso.numero}
              className="rounded-lg border border-[var(--brand-secondary)]/40 bg-white p-6"
            >
              <span className="mb-2 block text-2xl font-bold text-[var(--brand-primary)]">
                {paso.numero}
              </span>
              <h3 className="mb-2 font-semibold">{paso.titulo}</h3>
              <p className="text-sm text-muted-foreground">
                {paso.descripcion}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mb-20 rounded-2xl bg-[var(--brand-primary)] px-6 py-10 text-center">
        <h2 className="mb-2 text-2xl font-bold text-white">
          ¿Buscás algo en particular?
        </h2>
        <p className="mb-6 text-white/90">
          Explorá el catálogo completo y encontrá lo que necesitás.
        </p>
        <Button asChild size="lg" variant="secondary">
          <Link href="/catalogo">Ir al catálogo</Link>
        </Button>
      </section>

      {/* Preguntas frecuentes */}
      <section className="mb-20">
        <h2 className="mb-8 text-2xl font-bold">Preguntas frecuentes</h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.pregunta} className="border-b pb-6 last:border-0">
              <h3 className="mb-2 font-semibold">{faq.pregunta}</h3>
              <p className="text-muted-foreground">{faq.respuesta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Video promocional */}
      <section className="mb-20">
        <h2 className="mb-2 text-2xl font-bold text-[var(--brand-primary)]">
          Convertí lo que no usás en dinero
        </h2>
        <p className="mb-8 text-muted-foreground">
          Publicá en Rentalo y empezá a generar ingresos con cosas que hoy tenés guardadas.
        </p>
        <div className="flex justify-center">
          <PromoVideo />
        </div>
      </section>

      {/* Contacto */}
      <section className="text-center">
        <h2 className="mb-4 text-2xl font-bold">Contacto</h2>
        <p className="mb-6 text-muted-foreground">
          ¿Tenés dudas? Escribinos por WhatsApp y te respondemos.
        </p>
        <WhatsAppButton href={whatsappHref}>
          Contactar por WhatsApp
        </WhatsAppButton>
      </section>
    </div>
  );
}
