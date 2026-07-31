import "server-only";

import {
  buildPublicUrl,
  buildTelegramMessage,
  escapeHtml,
  formatArgentinaDateTime,
  getEnvironmentLabel,
  sendTelegramAdminNotification,
  type TelegramSendResult,
} from "@/lib/server/telegram";

export type NotifiableUser = {
  name?: string | null;
  email: string;
  isBusiness?: boolean | null;
  businessName?: string | null;
  contactWhatsapp?: string | null;
};

export type NotifiableProduct = {
  name: string;
  slug: string;
  category?: string | null;
  categoryName?: string | null;
  subcategoryName?: string | null;
  pricePerDay?: number | null;
  availableIn?: string[] | null;
  publishedBy?: string | null;
};

export type NewProductNotificationInput = {
  product: NotifiableProduct;
  owner?: NotifiableUser | null;
  assistedByAdmin?: boolean;
  assignedOwnerEmail?: string | null;
};

function field(label: string, value: string): string {
  return `<b>${label}:</b> ${escapeHtml(value)}`;
}

function formatPrice(pricePerDay: number | null | undefined): string {
  if (typeof pricePerDay !== "number" || !Number.isFinite(pricePerDay) || pricePerDay <= 0) {
    return "A convenir";
  }
  const amount = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(pricePerDay);
  return `${amount}/día`;
}

function formatLocation(availableIn: string[] | null | undefined): string {
  const places = (availableIn ?? []).map((p) => p.trim()).filter(Boolean);
  return places.length ? places.join(", ") : "No informada";
}

function publisherLabel(
  product: NotifiableProduct,
  owner: NotifiableUser | null | undefined
): string {
  if (product.publishedBy?.trim()) return product.publishedBy.trim();
  if (owner?.isBusiness && owner.businessName?.trim()) return owner.businessName.trim();
  if (owner?.name?.trim()) return owner.name.trim();
  return owner?.email ?? "Sin nombre informado";
}

function productLink(slug: string): string | null {
  const url = buildPublicUrl(`/p/${slug}`);
  if (!url) return null;
  return `🔗 <a href="${escapeHtml(url)}">Ver publicación</a>`;
}

/**
 * Notifica al admin que se creó una cuenta. Nunca lanza: la notificación es
 * secundaria y no debe afectar el registro.
 */
export async function notifyNewUserRegistered(
  user: NotifiableUser
): Promise<TelegramSendResult> {
  try {
    const lines = [
      field("Nombre", user.name?.trim() || "Sin nombre informado"),
      field("Email", user.email),
    ];

    if (user.isBusiness) {
      lines.push(field("Tipo", "Empresa / Emprendimiento"));
      if (user.businessName?.trim()) {
        lines.push(field("Empresa", user.businessName.trim()));
      }
    } else {
      lines.push(field("Tipo", "Particular"));
    }

    if (user.contactWhatsapp?.trim()) {
      lines.push(field("WhatsApp", user.contactWhatsapp.trim()));
    }

    lines.push(field("Fecha", formatArgentinaDateTime()));
    lines.push(field("Ambiente", getEnvironmentLabel()));

    const result = await sendTelegramAdminNotification({
      text: buildTelegramMessage({
        emoji: "👤",
        title: "Nuevo usuario registrado",
        lines,
      }),
    });

    if (result.sent) {
      console.log("[telegram] new user notification sent");
    } else if (!result.skipped) {
      console.error("[telegram] new user notification failed");
    }
    return result;
  } catch {
    console.error("[telegram] new user notification failed");
    return { sent: false, error: "notification build failed" };
  }
}

function buildAssistedMessage(input: NewProductNotificationInput): string {
  const { product, owner, assignedOwnerEmail } = input;
  const lines = [field("Creada por", "Administrador")];

  if (owner?.email) {
    lines.push(field("Asignada a", owner.email));
    lines.push(field("Producto", product.name));
    lines.push(field("Estado", "Activa"));

    const link = productLink(product.slug);
    if (link) {
      lines.push("", link);
    }
  } else {
    lines.push(field("Email pendiente", assignedOwnerEmail ?? "No informado"));
    lines.push(field("Producto", product.name));
    lines.push(field("Asignación", "Pendiente de registro"));
  }

  return buildTelegramMessage({
    emoji: "🛠",
    title: "Nueva publicación asistida",
    lines,
  });
}

function buildProductMessage(input: NewProductNotificationInput): string {
  const { product, owner } = input;
  const lines = [
    field("Publicador", publisherLabel(product, owner)),
    field("Email", owner?.email ?? "No informado"),
    field("Producto", product.name),
    field("Categoría", product.categoryName?.trim() || product.category?.trim() || "Sin categoría"),
  ];

  if (product.subcategoryName?.trim()) {
    lines.push(field("Subcategoría", product.subcategoryName.trim()));
  }

  lines.push(field("Ubicación", formatLocation(product.availableIn)));
  lines.push(field("Precio", formatPrice(product.pricePerDay)));
  lines.push(field("Estado", "Activa"));
  lines.push(field("Fecha", formatArgentinaDateTime()));

  const link = productLink(product.slug);
  if (link) {
    lines.push("", link);
  }

  return buildTelegramMessage({
    emoji: "📦",
    title: "Nueva publicación",
    lines,
  });
}

/**
 * Notifica al admin que se publicó un producto. Envía el mensaje asistido o el
 * normal, nunca ambos. Nunca lanza: la notificación es secundaria.
 */
export async function notifyNewProductPublished(
  input: NewProductNotificationInput
): Promise<TelegramSendResult> {
  const assisted = Boolean(input.assistedByAdmin);

  try {
    const text = assisted ? buildAssistedMessage(input) : buildProductMessage(input);
    const result = await sendTelegramAdminNotification({ text });

    if (result.sent) {
      console.log(
        assisted
          ? "[telegram] assisted product notification sent"
          : "[telegram] new product notification sent"
      );
    } else if (!result.skipped) {
      console.error(
        assisted
          ? "[telegram] assisted product notification failed"
          : "[telegram] new product notification failed"
      );
    }
    return result;
  } catch {
    console.error(
      assisted
        ? "[telegram] assisted product notification failed"
        : "[telegram] new product notification failed"
    );
    return { sent: false, error: "notification build failed" };
  }
}