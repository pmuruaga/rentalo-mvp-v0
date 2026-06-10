const LABELS: Record<string, string> = {
  REQUESTED: "Solicitado",
  APPROVED: "Aprobado",
  ACTIVE: "En curso",
  RETURNED: "Devuelto, pendiente de confirmación",
  RETURN_CONFIRMED: "Devolución confirmada",
  CANCELLED: "Cancelado",
};

export function rentalStatusLabel(status: string): string {
  return LABELS[status] ?? status;
}
