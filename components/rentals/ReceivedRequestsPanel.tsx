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
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { rentalStatusLabel } from "@/lib/rentalLabels";

interface Row {
  id: string;
  status: string;
  createdAt: string;
  hasSubmittedReview: boolean;
  product: { id: string; name: string; slug: string };
  renter: { id: string; name: string; email: string };
}

export function ReceivedRequestsPanel() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reviewOpenId, setReviewOpenId] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const res = await fetch("/api/me/rental-requests");
    if (res.status === 401) {
      router.replace("/login?callbackUrl=%2Fsolicitudes-recibidas");
      return;
    }
    if (!res.ok) {
      setError("No se pudieron cargar las solicitudes.");
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

  const setStatus = async (
    id: string,
    status: "APPROVED" | "CANCELLED" | "RETURN_CONFIRMED"
  ) => {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/me/rental-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.status === 401) {
      router.replace("/login?callbackUrl=%2Fsolicitudes-recibidas");
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "No se pudo actualizar.");
      setBusyId(null);
      return;
    }
    await load();
    if (status === "RETURN_CONFIRMED") {
      setReviewOpenId(id);
    }
    setBusyId(null);
  };

  const onReviewSubmitted = async (id: string) => {
    setReviewOpenId(null);
    await load();
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando…</p>;
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tenés solicitudes sobre tus publicaciones.
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
            <TableHead>Quién alquila</TableHead>
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
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{r.renter.name}</div>
                  <div className="text-muted-foreground">{r.renter.email}</div>
                </div>
              </TableCell>
              <TableCell>{rentalStatusLabel(r.status)}</TableCell>
              <TableCell className="text-right">
                {r.status === "REQUESTED" ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === r.id}
                      onClick={() => void setStatus(r.id, "APPROVED")}
                    >
                      Aprobar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === r.id}
                      onClick={() => void setStatus(r.id, "CANCELLED")}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : r.status === "RETURNED" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busyId === r.id}
                    onClick={() => void setStatus(r.id, "RETURN_CONFIRMED")}
                  >
                    {busyId === r.id ? "…" : "Confirmar devolución en condiciones"}
                  </Button>
                ) : r.status === "RETURN_CONFIRMED" ? (
                  r.hasSubmittedReview ? (
                    <span className="text-xs text-muted-foreground">
                      Calificación enviada
                    </span>
                  ) : reviewOpenId === r.id ? (
                    <ReviewForm
                      rentalId={r.id}
                      targetName={r.renter.name}
                      onSubmitted={() => void onReviewSubmitted(r.id)}
                    />
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewOpenId(r.id)}
                    >
                      Calificar al locatario
                    </Button>
                  )
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
