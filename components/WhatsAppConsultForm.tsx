"use client";

import { useState } from "react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Input } from "@/components/ui/input";

interface WhatsAppConsultFormProps {
  productName: string;
  productSlug: string;
  baseWhatsAppUrl: string;
  city?: string;
}

function buildWhatsAppUrl(baseUrl: string, message: string): string {
  const text = encodeURIComponent(message);
  return `${baseUrl}?text=${text}`;
}

export function WhatsAppConsultForm({
  productName,
  productSlug,
  baseWhatsAppUrl,
  city = "Frías",
}: WhatsAppConsultFormProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const formatDate = (d: string) => {
    const date = new Date(d + "T12:00:00");
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDateText = () => {
    if (dateFrom && dateTo) {
      return `${formatDate(dateFrom)} a ${formatDate(dateTo)}`;
    }
    if (dateFrom) return formatDate(dateFrom);
    if (dateTo) return formatDate(dateTo);
    return "fecha a confirmar";
  };

  const message = [
    `Hola, me interesa alquilar *${productName}*.`,
    "",
    `Fecha tentativa: ${getDateText()}`,
    `Ciudad: ${city}`,
  ].join("\n");

  const href = buildWhatsAppUrl(baseWhatsAppUrl, message);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            Fecha desde (opcional)
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            Fecha hasta (opcional)
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>
      <WhatsAppButton
        href={href}
        className="w-full justify-center sm:w-auto"
        analyticsEvent="click_whatsapp_product"
        analyticsParams={{ product_slug: productSlug, product_name: productName }}
      >
        Consultar por WhatsApp
      </WhatsAppButton>
    </div>
  );
}
