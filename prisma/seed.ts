import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";
import { CATEGORY_SEED_DATA } from "../data/categories";

const prisma = new PrismaClient();

async function seedCategories() {
  for (let i = 0; i < CATEGORY_SEED_DATA.length; i++) {
    const cat = CATEGORY_SEED_DATA[i];
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      create: { name: cat.name, sortOrder: i },
      update: { sortOrder: i },
    });

    for (let j = 0; j < cat.subcategories.length; j++) {
      const subName = cat.subcategories[j];
      await prisma.subcategory.upsert({
        where: {
          categoryId_name: {
            categoryId: category.id,
            name: subName,
          },
        },
        create: {
          name: subName,
          categoryId: category.id,
          sortOrder: j,
        },
        update: {
          sortOrder: j,
        },
      });
    }
  }

  console.log(`Seeded ${CATEGORY_SEED_DATA.length} categories`);
}

async function seedProducts() {
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

async function main() {
  await seedCategories();
  await seedProducts();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
