export interface Product {
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
  whatsappNumber?: string | null;
  deliveryMethod?: string;
  condition?: string;
  availabilityNotes?: string;
  requirements?: string;
  minimumRentalPeriod?: string;
  importantInfo?: string;
}
