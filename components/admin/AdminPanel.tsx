"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductForm } from "./ProductForm";

interface Product {
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
}

interface AdminPanelProps {
  adminKey: string;
}

export function AdminPanel({ adminKey }: AdminPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products", {
      headers: { "x-admin-key": adminKey },
    });
    if (res.ok) {
      const data = await res.json();
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (adminKey) fetchProducts();
  }, [adminKey]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    if (res.ok) {
      setProducts((p) => p.filter((x) => x.id !== id));
      setEditingId(null);
    }
  };

  const handleSave = async (data: Partial<Product> & { name: string }) => {
    if (editingId) {
      const res = await fetch(`/api/admin/products/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts((p) => p.map((x) => (x.id === editingId ? updated : x)));
        setEditingId(null);
      }
    } else if (creating) {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setProducts((p) => [...p, created].sort((a, b) => a.name.localeCompare(b.name)));
        setCreating(false);
      }
    }
  };

  const cancelForm = () => {
    setEditingId(null);
    setCreating(false);
  };

  if (loading) {
    return <p className="text-muted-foreground">Cargando productos...</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Productos</h1>

      {(editingId || creating) ? (
        <ProductForm
          product={
            editingId
              ? products.find((p) => p.id === editingId)
              : undefined
          }
          onSave={handleSave}
          onCancel={cancelForm}
        />
      ) : (
        <>
          <Button className="mb-4" onClick={() => setCreating(true)}>
            Nuevo producto
          </Button>
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
                      <Link href={`/p/${p.slug}`} target="_blank" className="hover:underline">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>${p.pricePerDay.toLocaleString("es-AR")}</TableCell>
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
                          onClick={() => handleDelete(p.id)}
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
        </>
      )}
    </div>
  );
}
