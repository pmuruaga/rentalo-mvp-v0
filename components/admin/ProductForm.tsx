"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  availableIn?: string[];
  publishedBy?: string;
  whatsappNumber?: string;
}

interface ProductFormProps {
  product?: Product;
  onSave: (data: Partial<Product> & { name: string }) => Promise<void>;
  onCancel: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({
  product,
  onSave,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [pricePerDay, setPricePerDay] = useState(
    String(product?.pricePerDay ?? "")
  );
  const [shortDescription, setShortDescription] = useState(
    product?.shortDescription ?? ""
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [imagesStr, setImagesStr] = useState(
    product?.images?.join("\n") ?? ""
  );
  const [whatsappMessageTemplate, setWhatsappMessageTemplate] = useState(
    product?.whatsappMessageTemplate ?? ""
  );
  const [queIncluyeStr, setQueIncluyeStr] = useState(
    product?.queIncluye?.join("\n") ?? ""
  );
  const [availableInStr, setAvailableInStr] = useState(
    product?.availableIn?.join("\n") ?? "Frías"
  );
  const [publishedBy, setPublishedBy] = useState(
    product?.publishedBy ?? ""
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    product?.whatsappNumber ?? ""
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!product && name) {
      setSlug(slugify(name));
    }
  }, [name, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        name,
        slug,
        category,
        pricePerDay: Number(pricePerDay) || 0,
        shortDescription,
        description,
        images: imagesStr
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        whatsappMessageTemplate,
        queIncluye: queIncluyeStr
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        availableIn: availableInStr
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        publishedBy: publishedBy.trim() || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold">
        {product ? "Editar producto" : "Nuevo producto"}
      </h2>

      <div>
        <label className="mb-1 block text-sm font-medium">Nombre *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Slug (URL) *</label>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          placeholder="producto-ejemplo"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Categoría *</label>
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          placeholder="inflables, juegos, etc."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Precio por día *</label>
        <Input
          type="number"
          value={pricePerDay}
          onChange={(e) => setPricePerDay(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descripción corta *</label>
        <Input
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descripción *</label>
        <textarea
          className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          URLs de imágenes (una por línea)
        </label>
        <textarea
          className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          value={imagesStr}
          onChange={(e) => setImagesStr(e.target.value)}
          placeholder="/products/foto.jpg"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Mensaje WhatsApp (plantilla)
        </label>
        <Input
          value={whatsappMessageTemplate}
          onChange={(e) => setWhatsappMessageTemplate(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Qué incluye (una por línea)
        </label>
        <textarea
          className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          value={queIncluyeStr}
          onChange={(e) => setQueIncluyeStr(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Disponible en (una por línea, ej: Frías, Salta, Todo el país)
        </label>
        <textarea
          className="min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          value={availableInStr}
          onChange={(e) => setAvailableInStr(e.target.value)}
          placeholder="Frías"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Publicado por
        </label>
        <Input
          value={publishedBy}
          onChange={(e) => setPublishedBy(e.target.value)}
          placeholder="PabloMur81, CrokyCrokyEventos"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          WhatsApp del publicador (opcional, ej: 5493851234567)
        </label>
        <Input
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="Si está vacío, usa el número general de Rentalo"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
