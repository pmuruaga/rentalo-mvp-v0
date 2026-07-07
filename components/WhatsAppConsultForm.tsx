"use client";

import { useState } from "react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { RentalDateFields } from "@/components/rentals/RentalDateFields";
import { rentalDateRangeText, validateRentalDateRange } from "@/lib/rentalDates";

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

  const validation = validateRentalDateRange(dateFrom, dateTo);
  const canSubmit = validation.valid;

  const message = [
    `Hola, me interesa alquilar *${productName}*.`,
    "",
    `Fecha tentativa: ${rentalDateRangeText(dateFrom, dateTo)}`,
    `Ciudad: ${city}`,
  ].join("\n");

  const href = buildWhatsAppUrl(baseWhatsAppUrl, message);

  return (
    <div className="space-y-4">
      <RentalDateFields
        dateFrom={dateFrom}
        dateTo={dateTo}
        fromLabel="Fecha desde (opcional)"
        toLabel="Fecha hasta (opcional)"
        onChange={({ dateFrom: nextFrom, dateTo: nextTo }) => {
          setDateFrom(nextFrom);
          setDateTo(nextTo);
        }}
      />
      <WhatsAppButton
        href={href}
        className="w-full justify-center sm:w-auto"
        analyticsEvent="click_whatsapp_product"
        analyticsParams={{ product_slug: productSlug, product_name: productName }}
        disabled={!canSubmit}
      >
        Consultar por WhatsApp
      </WhatsAppButton>
    </div>
  );
}
