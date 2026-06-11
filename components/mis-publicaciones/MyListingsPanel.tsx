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
import { ProductForm } from "@/components/admin/ProductForm";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  pricePerDay: number;
  shortDescription: string;
  description: string;
  images: string[];
  whatsappMessageTemplate: string;
  queIncluye?: string[];
  availableIn?: string[];
  publishedBy?: string;
  whatsappNumber?: string;
  deliveryMethod?: string;
  condition?: string;
  availabilityNotes?: string;
  requirements?: string;
  minimumRentalPeriod?: string;
  importantInfo?: string;
}

interface PublisherInfo {
  publishedBy: string;
  whatsappNumber: string;
}

export function MyListingsPanel() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publisher, setPublisher] = useState<PublisherInfo>({
    publishedBy: "",
    whatsappNumber: "",
  });

  const fetchProfile = async () => {
    const res = await fetch("/api/me/profile");
    if (!res.ok) return;
    const profile = (await res.json()) as {
      name: string;
      email: string;
      isBusiness: boolean;
      businessName: string | null;
      contactWhatsapp: string | null;
    };
    setPublisher({
      publishedBy:
        profile.isBusiness && profile.businessName?.trim()
          ? profile.businessName.trim()
          : profile.name || profile.email,
      whatsappNumber: profile.contactWhatsapp?.trim() ?? "",
    });
  };

  const fetchProducts = async () => {
    setError(null);
    const res = await fetch("/api/me/products");
    if (res.status === 401) {
      router.replace("/login?callbackUrl=%2Fmis-publicaciones");
      return;
    }
    if (!res.ok) {
      setError("No se pudieron cargar tus publicaciones.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as ProductRow[];
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchProducts();
    void fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta publicación?")) return;
    setError(null);
    const res = await fetch(`/api/me/products/${id}`, { method: "DELETE" });
    if (res.status === 401) {
      router.replace("/login?callbackUrl=%2Fmis-publicaciones");
      return;
    }
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "No se pudo eliminar.");
      return;
    }
    setProducts((p) => p.filter((x) => x.id !== id));
    setEditingId(null);
  };

  const handleSave = async (
    data: Partial<ProductRow> & { name: string }
  ) => {
    setError(null);
    if (editingId) {
      const res = await fetch(`/api/me/products/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 401) {
        router.replace("/login?callbackUrl=%2Fmis-publicaciones");
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "No se pudo guardar.");
        return;
      }
      const updated = (await res.json()) as ProductRow;
      setProducts((p) => p.map((x) => (x.id === editingId ? updated : x)));
      setEditingId(null);
    } else if (creating) {
      const res = await fetch("/api/me/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 401) {
        router.replace("/login?callbackUrl=%2Fmis-publicaciones");
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "No se pudo crear la publicación.");
        return;
      }
      const created = (await res.json()) as ProductRow;
      setProducts((p) =>
        [...p, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setCreating(false);
    }
  };

  const cancelForm = () => {
    setEditingId(null);
    setCreating(false);
    setError(null);
  };

  if (loading) {
    return <p className="text-muted-foreground">Cargando…</p>;
  }

  return (
    <div>
      {error ? (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {editingId || creating ? (
        <ProductForm
          product={
            editingId
              ? products.find((p) => p.id === editingId)
              : undefined
          }
          publisher={publisher}
          onSave={handleSave}
          onCancel={cancelForm}
        />
      ) : (
        <>
          <Button className="mb-4" onClick={() => setCreating(true)}>
            Nueva publicación
          </Button>
          {products.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              <p className="mb-2">
                Todavía no tenés publicaciones. Creá la primera con el botón de
                arriba.
              </p>
              <p className="text-sm">
                Aparecerán en el catálogo público junto al resto de los
                productos activos.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio/día</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link
                          href={`/p/${p.slug}`}
                          target="_blank"
                          className="hover:underline"
                        >
                          {p.name}
                        </Link>
                      </TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>
                        ${p.pricePerDay.toLocaleString("es-AR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(p.id)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => void handleDelete(p.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
