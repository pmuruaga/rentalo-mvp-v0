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
  deliveryMethod?: string;
  condition?: string;
  availabilityNotes?: string;
  requirements?: string;
  minimumRentalPeriod?: string;
  importantInfo?: string;
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
  const [deliveryMethod, setDeliveryMethod] = useState(
    product?.deliveryMethod ?? ""
  );
  const [condition, setCondition] = useState(product?.condition ?? "");
  const [availabilityNotes, setAvailabilityNotes] = useState(
    product?.availabilityNotes ?? ""
  );
  const [requirements, setRequirements] = useState(
    product?.requirements ?? ""
  );
  const [minimumRentalPeriod, setMinimumRentalPeriod] = useState(
    product?.minimumRentalPeriod ?? ""
  );
  const [importantInfo, setImportantInfo] = useState(
    product?.importantInfo ?? ""
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
          .filter(Boolean)
          .slice(0, 10),
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
        deliveryMethod: deliveryMethod.trim() || undefined,
        condition: condition.trim() || undefined,
        availabilityNotes: availabilityNotes.trim() || undefined,
        requirements: requirements.trim() || undefined,
        minimumRentalPeriod: minimumRentalPeriod.trim() || undefined,
        importantInfo: importantInfo.trim() || undefined,
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
          URLs de imágenes (hasta 10, una por línea)
        </label>
        <textarea
          className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          value={imagesStr}
          onChange={(e) => setImagesStr(e.target.value)}
          placeholder="/products/foto.jpg"
          maxLength={5000}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {imagesStr.split("\n").filter((s) => s.trim()).length}/10 imágenes
        </p>
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
          Forma de entrega
        </label>
        <Input
          value={deliveryMethod}
          onChange={(e) => setDeliveryMethod(e.target.value)}
          placeholder="Retiro, Envío, Ambos"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Estado / condición
        </label>
        <Input
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder="Nuevo, Usado, Excelente estado, Con detalles"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Notas de disponibilidad
        </label>
        <Input
          value={availabilityNotes}
          onChange={(e) => setAvailabilityNotes(e.target.value)}
          placeholder="Disponible inmediato, Solo fines de semana"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Requisitos
        </label>
        <Input
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Se solicita DNI y seña"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Período mínimo de alquiler
        </label>
        <Input
          value={minimumRentalPeriod}
          onChange={(e) => setMinimumRentalPeriod(e.target.value)}
          placeholder="Mínimo 1 día, Mínimo 3 horas"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Información importante
        </label>
        <textarea
          className="min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          value={importantInfo}
          onChange={(e) => setImportantInfo(e.target.value)}
          placeholder="Algo que el cliente debería saber antes de alquilar"
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
