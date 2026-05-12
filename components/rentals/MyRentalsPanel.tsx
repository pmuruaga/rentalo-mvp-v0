"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { rentalStatusLabel } from "@/lib/rentalLabels";

interface Row {
  id: string;
  status: string;
  createdAt: string;
  product: { id: string; name: string; slug: string };
}

export function MyRentalsPanel() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const res = await fetch("/api/me/rentals");
    if (res.status === 401) {
      router.replace("/login?callbackUrl=%2Fmis-alquileres");
      return;
    }
    if (!res.ok) {
      setError("No se pudieron cargar tus alquileres.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as Row[];
    setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markReturned = async (id: string) => {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/me/rentals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "return" }),
    });
    if (res.status === 401) {
      router.replace("/login?callbackUrl=%2Fmis-alquileres");
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "No se pudo actualizar.");
      setBusyId(null);
      return;
    }
    await load();
    setBusyId(null);
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando…</p>;
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no solicitaste ningún alquiler.{" "}
        <Link
          href="/catalogo"
          className="font-medium text-[var(--brand-primary)] underline"
        >
          Ver catálogo
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <Link
                  href={`/p/${r.product.slug}`}
                  className="font-medium text-[var(--brand-primary)] hover:underline"
                >
                  {r.product.name}
                </Link>
              </TableCell>
              <TableCell>{rentalStatusLabel(r.status)}</TableCell>
              <TableCell className="text-right">
                {r.status === "APPROVED" || r.status === "ACTIVE" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busyId === r.id}
                    onClick={() => void markReturned(r.id)}
                  >
                    {busyId === r.id ? "…" : "Marcar como devuelto"}
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
