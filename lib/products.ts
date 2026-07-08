export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  categoryName?: string;
  subcategoryName?: string;
  pricePerDay: number;
  shortDescription: string;
  description: string;
  images: string[];
  whatsappMessageTemplate: string;
  queIncluye?: string[];
  availableIn?: string[];
  publishedBy?: string;
  whatsappNumber?: string | null;
  deliveryMethod?: string;
  condition?: string;
  availabilityNotes?: string;
  requirements?: string;
  minimumRentalPeriod?: string;
  importantInfo?: string;
  /** Dueño (Better Auth). Null en catálogo heredado o creado solo por admin. */
  ownerId?: string | null;
  /** Email al que está preasignada la publicación (admin asistido). */
  assignedOwnerEmail?: string | null;
  status?: string;
}
