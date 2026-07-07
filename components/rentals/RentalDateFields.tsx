"use client";

import { Input } from "@/components/ui/input";
import {
  compareDateStrings,
  todayDateString,
  validateRentalDateRange,
} from "@/lib/rentalDates";

type Props = {
  dateFrom: string;
  dateTo: string;
  onChange: (next: { dateFrom: string; dateTo: string }) => void;
  required?: boolean;
  fromLabel?: string;
  toLabel?: string;
};

export function RentalDateFields({
  dateFrom,
  dateTo,
  onChange,
  required = false,
  fromLabel = "Fecha desde",
  toLabel = "Fecha hasta",
}: Props) {
  const today = todayDateString();
  const validation = validateRentalDateRange(dateFrom, dateTo, {
    required,
    today,
  });
  const showMessage =
    !validation.valid && (required || Boolean(dateFrom || dateTo));

  const handleDateFromChange = (value: string) => {
    let nextDateTo = dateTo;
    if (nextDateTo && value && compareDateStrings(nextDateTo, value) < 0) {
      nextDateTo = "";
    }
    onChange({ dateFrom: value, dateTo: nextDateTo });
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            {fromLabel}
          </label>
          <Input
            type="date"
            value={dateFrom}
            min={today}
            onChange={(e) => handleDateFromChange(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            {toLabel}
          </label>
          <Input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            disabled={!dateFrom}
            onChange={(e) =>
              onChange({ dateFrom, dateTo: e.target.value })
            }
          />
        </div>
      </div>
      {showMessage && validation.message ? (
        <p className="text-sm text-destructive">{validation.message}</p>
      ) : null}
    </div>
  );
}
