const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function todayDateString(
  timeZone = "America/Argentina/Buenos_Aires"
): string {
  return new Date().toLocaleDateString("en-CA", { timeZone });
}

export function isValidDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime());
}

export function compareDateStrings(a: string, b: string): number {
  return a.localeCompare(b);
}

export type RentalDateValidation = {
  valid: boolean;
  message: string | null;
};

export function validateRentalDateRange(
  dateFrom: string,
  dateTo: string,
  options?: { required?: boolean; today?: string }
): RentalDateValidation {
  const today = options?.today ?? todayDateString();
  const required = options?.required ?? false;

  if (!dateFrom && !dateTo) {
    return required
      ? {
          valid: false,
          message: "Elegí las fechas del alquiler para continuar.",
        }
      : { valid: true, message: null };
  }

  if (!dateFrom && dateTo) {
    return { valid: false, message: "Primero elegí la fecha desde." };
  }

  if (dateFrom && !isValidDateString(dateFrom)) {
    return { valid: false, message: "La fecha desde no es válida." };
  }

  if (dateFrom && compareDateStrings(dateFrom, today) < 0) {
    return {
      valid: false,
      message: "La fecha desde no puede ser anterior a hoy.",
    };
  }

  if (dateTo && !isValidDateString(dateTo)) {
    return { valid: false, message: "La fecha hasta no es válida." };
  }

  if (dateFrom && dateTo && compareDateStrings(dateTo, dateFrom) < 0) {
    return {
      valid: false,
      message:
        "La fecha hasta debe ser igual o posterior a la fecha desde.",
    };
  }

  if (required && (!dateFrom || !dateTo)) {
    return {
      valid: false,
      message: "Elegí las fechas del alquiler para continuar.",
    };
  }

  return { valid: true, message: null };
}

export function formatRentalDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function rentalDateRangeText(dateFrom: string, dateTo: string): string {
  const validation = validateRentalDateRange(dateFrom, dateTo);
  if (!validation.valid) return "fecha a confirmar";
  if (dateFrom && dateTo) {
    return `${formatRentalDate(dateFrom)} a ${formatRentalDate(dateTo)}`;
  }
  if (dateFrom) return formatRentalDate(dateFrom);
  return "fecha a confirmar";
}
