import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  const path = join(process.cwd(), "data", "products.json");
  const raw = readFileSync(path, "utf-8");
  const products = JSON.parse(raw) as Array<{
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
  }>;

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        name: p.name,
        slug: p.slug,
        category: p.category,
        pricePerDay: p.pricePerDay,
        shortDescription: p.shortDescription,
        description: p.description,
        images: JSON.stringify(p.images),
        whatsappMessageTemplate: p.whatsappMessageTemplate,
        queIncluye: p.queIncluye ? JSON.stringify(p.queIncluye) : null,
        availableIn: JSON.stringify(p.availableIn ?? ["Frías"]),
        publishedBy: p.publishedBy ?? "Rentalo",
        whatsappNumber: p.whatsappNumber?.trim() || null,
      },
      update: {
        name: p.name,
        category: p.category,
        pricePerDay: p.pricePerDay,
        shortDescription: p.shortDescription,
        description: p.description,
        images: JSON.stringify(p.images),
        whatsappMessageTemplate: p.whatsappMessageTemplate,
        queIncluye: p.queIncluye ? JSON.stringify(p.queIncluye) : null,
        availableIn: JSON.stringify(p.availableIn ?? ["Frías"]),
        publishedBy: p.publishedBy ?? "Rentalo",
        whatsappNumber: p.whatsappNumber?.trim() || null,
      },
    });
  }

  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
