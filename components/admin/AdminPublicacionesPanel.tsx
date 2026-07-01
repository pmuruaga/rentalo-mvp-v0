"use client";

import { useEffect, useState } from "react";
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

type AdminProductRow = {
  id: string;
  name: string;
  status?: string;
  publishedBy?: string;
  categoryLabel: string;
  ownerName: string | null;
  ownerEmail: string | null;
};

function statusLabel(status: string | undefined): string {
  switch (status) {
    case "ACTIVE":
      return "Activa";
    case "PAUSED":
      return "Pausada";
    case "DISABLED":
      return "Desactivada";
    default:
      return status ?? "—";
  }
}

function publisherLabel(row: AdminProductRow): string {
  if (row.publishedBy?.trim()) return row.publishedBy;
  if (row.ownerName?.trim()) return row.ownerName;
  if (row.ownerEmail) return row.ownerEmail;
  return "—";
}

export function AdminPublicacionesPanel() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setError(null);
    const res = await fetch("/api/admin/publicaciones", { cache: "no-store" });
    if (res.status === 401) {
      router.replace("/login?callbackUrl=%2Fadmin%2Fpublicaciones");
      return;
    }
    if (res.status === 403) {
      router.replace("/");
      return;
    }
    if (!res.ok) {
      setError("No se pudieron cargar las publicaciones.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as AdminProductRow[];
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  const updateStatus = async (id: string, status: "ACTIVE" | "DISABLED") => {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/publicaciones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        router.replace("/login?callbackUrl=%2Fadmin%2Fpublicaciones");
        return;
      }
      if (res.status === 403) {
        router.replace("/");
        return;
      }
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "No se pudo actualizar la publicación.");
        return;
      }
      const updated = (await res.json()) as AdminProductRow;
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: updated.status } : p
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Cargando publicaciones…</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Admin · Publicaciones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revisá y desactivá publicaciones del catálogo.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {products.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-muted/50 p-8 text-center text-muted-foreground">
          No hay publicaciones.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Publicado por</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{publisherLabel(p)}</TableCell>
                  <TableCell>{p.categoryLabel}</TableCell>
                  <TableCell>{statusLabel(p.status)}</TableCell>
                  <TableCell className="text-right">
                    {p.status === "DISABLED" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={updatingId === p.id}
                        onClick={() => void updateStatus(p.id, "ACTIVE")}
                      >
                        {updatingId === p.id ? "…" : "Reactivar"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={updatingId === p.id}
                        onClick={() => void updateStatus(p.id, "DISABLED")}
                      >
                        {updatingId === p.id ? "…" : "Desactivar"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
