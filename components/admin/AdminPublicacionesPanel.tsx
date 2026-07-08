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
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/lib/products";

type AdminProductRow = {
  id: string;
  name: string;
  status?: string;
  publishedBy?: string;
  categoryLabel: string;
  ownerId?: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  assignedOwnerEmail?: string | null;
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
  if (row.assignedOwnerEmail) return row.assignedOwnerEmail;
  return "—";
}

function assignmentLabel(row: AdminProductRow): string {
  if (row.ownerId) return "Asignada";
  if (row.assignedOwnerEmail) return "Pendiente de usuario";
  return "Sin asignar";
}

export function AdminPublicacionesPanel() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  const handleCreateAssisted = async (
    data: Partial<Product> & {
      name: string;
      categoryId: string;
      subcategoryId: string;
      assignedOwnerEmail?: string;
    }
  ) => {
    setCreateError(null);
    const res = await fetch("/api/admin/publicaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
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
      const body = (await res.json()) as { error?: string };
      setCreateError(body.error ?? "No se pudo crear la publicación.");
      return;
    }
    const created = (await res.json()) as AdminProductRow;
    setProducts((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
    );
    setShowCreateForm(false);
  };

  if (loading) {
    return <p className="text-muted-foreground">Cargando publicaciones…</p>;
  }

  if (showCreateForm) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Admin · Publicaciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Creá una publicación y asignalá al futuro publicador por email.
          </p>
        </div>
        {createError ? (
          <p className="text-sm text-destructive" role="alert">
            {createError}
          </p>
        ) : null}
        <div className="rounded-lg border p-4">
          <ProductForm
            assistedPublication
            onSave={handleCreateAssisted}
            onCancel={() => {
              setShowCreateForm(false);
              setCreateError(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin · Publicaciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisá, creá publicaciones asistidas y desactivá publicaciones del
            catálogo.
          </p>
        </div>
        <Button type="button" onClick={() => setShowCreateForm(true)}>
          Crear publicación asistida
        </Button>
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
                <TableHead>Asignación</TableHead>
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
                  <TableCell>
                    <span className="text-sm">{assignmentLabel(p)}</span>
                    {p.assignedOwnerEmail && !p.ownerId ? (
                      <p className="text-xs text-muted-foreground">
                        {p.assignedOwnerEmail}
                      </p>
                    ) : null}
                  </TableCell>
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
