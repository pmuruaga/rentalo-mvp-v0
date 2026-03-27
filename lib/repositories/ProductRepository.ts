import type { Product } from "@/lib/products";

export interface ProductCreateInput {
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
  whatsappNumber?: string | null;
  deliveryMethod?: string;
  condition?: string;
  availabilityNotes?: string;
  requirements?: string;
  minimumRentalPeriod?: string;
  importantInfo?: string;
}

export interface ProductRepository {
  list(): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getById(id: string): Promise<Product | null>;
  create(data: ProductCreateInput): Promise<Product>;
  update(id: string, data: Partial<ProductCreateInput>): Promise<Product>;
  delete(id: string): Promise<void>;
}
