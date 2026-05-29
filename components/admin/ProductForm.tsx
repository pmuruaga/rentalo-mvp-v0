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

const MAX_IMAGES = 10;

interface ProductFormProps {
  product?: Product;
  adminKey?: string;
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
  adminKey,
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
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
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

  useEffect(() => {
    setImages(product?.images ?? []);
    setImageError(null);
  }, [product?.id]);

  const uploadImage = async (file: File): Promise<string> => {
    console.log("[Rentalo upload] starting upload", file.name);

    const formData = new FormData();
    formData.append("file", file);
    const productSlug =
      slug.trim() || (name.trim() ? slugify(name) : "");
    if (productSlug) formData.append("productSlug", productSlug);
    if (product?.id) formData.append("productId", product.id);

    const res = await fetch("/api/products/images/upload", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
      headers: adminKey ? { "x-admin-key": adminKey } : undefined,
    });

    let data: { url?: string; error?: string };
    try {
      data = (await res.json()) as { url?: string; error?: string };
    } catch {
      console.log("[Rentalo upload] response.status", res.status);
      console.log("[Rentalo upload] response body", "(no JSON)");
      throw new Error(
        res.ok
          ? "Respuesta inválida del servidor."
          : "No se pudo subir la imagen."
      );
    }

    console.log("[Rentalo upload] response.status", res.status);
    console.log("[Rentalo upload] response body", data);

    if (!res.ok) {
      throw new Error(data.error ?? "No se pudo subir la imagen.");
    }
    if (!data.url) {
      throw new Error("Respuesta inválida del servidor.");
    }

    console.log("[Rentalo upload] URL received", data.url);
    return data.url;
  };

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[Rentalo upload] onChange fired");

    const fileList = e.target.files;
    const count = fileList?.length ?? 0;
    console.log("[Rentalo upload] file count:", count);

    if (fileList?.length) {
      console.log(
        "[Rentalo upload] files:",
        Array.from(fileList).map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
        }))
      );
    }

    e.target.value = "";
    if (!fileList?.length) return;

    // Feedback inmediato (aunque falle rápido)
    setImageError(null);
    setUploading(true);

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setImageError("Máximo 10 imágenes por producto.");
      setUploading(false);
      return;
    }

    const files = Array.from(fileList).slice(0, remaining);
    const truncated = fileList.length > remaining;

    let uploadedCount = 0;
    try {
      for (const file of files) {
        const url = await uploadImage(file);
        uploadedCount += 1;
        setImages((prev) => [...prev, url].slice(0, MAX_IMAGES));
      }
      if (truncated) {
        setImageError(`Solo se agregaron ${remaining} imagen(es) (límite 10).`);
      } else {
        setImageError(null);
      }
    } catch (err) {
      const message =
        err instanceof TypeError
          ? "No se pudo conectar con el servidor. Revisá tu conexión."
          : err instanceof Error
            ? err.message
            : "Error al subir imágenes.";
      setImageError(
        uploadedCount > 0
          ? `${message} (${uploadedCount} imagen(es) ya se subieron.)`
          : message
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageError(null);
  };

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
        images: images.slice(0, MAX_IMAGES),
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
          Imágenes (hasta 10)
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading || images.length >= MAX_IMAGES}
          onChange={(e) => void handleImageFiles(e)}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {images.length}/{MAX_IMAGES} imágenes
          {uploading ? " · Subiendo…" : null}
        </p>
        {imageError ? (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {imageError}
          </p>
        ) : null}
        {images.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-3">
            {images.map((url, index) => (
              <li key={`${url}-${index}`} className="relative">
                <div className="h-20 w-20 overflow-hidden rounded-md border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={uploading}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground"
                  aria-label="Quitar imagen"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
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
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Guardando..." : uploading ? "Subiendo imágenes…" : "Guardar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
