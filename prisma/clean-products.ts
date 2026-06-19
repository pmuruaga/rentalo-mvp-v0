import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ReviewDelegate = {
  deleteMany: (args?: object) => Promise<{ count: number }>;
};

async function deleteReviewsIfExist(): Promise<number> {
  const review = (prisma as unknown as { review?: ReviewDelegate }).review;

  if (!review) {
    console.log("Reviews: modelo no definido en schema, omitido.");
    return 0;
  }

  const { count } = await review.deleteMany();
  return count;
}

async function main() {
  console.log("Iniciando limpieza del catálogo (sin tocar users ni categorías)...\n");

  const reviewsDeleted = await deleteReviewsIfExist();
  const { count: rentalsDeleted } = await prisma.rental.deleteMany();
  const { count: productsDeleted } = await prisma.product.deleteMany();

  const [users, categories, subcategories, sessions, accounts] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.subcategory.count(),
    prisma.session.count(),
    prisma.account.count(),
  ]);

  console.log("--- Registros borrados ---");
  console.log(`Reviews:  ${reviewsDeleted}`);
  console.log(`Rentals:  ${rentalsDeleted}`);
  console.log(`Products: ${productsDeleted}`);

  console.log("\n--- Datos conservados ---");
  console.log(`Users:          ${users}`);
  console.log(`Sessions:       ${sessions}`);
  console.log(`Accounts:       ${accounts}`);
  console.log(`Categories:     ${categories}`);
  console.log(`Subcategories:  ${subcategories}`);

  console.log("\nLimpieza completada.");
}

main()
  .catch((error) => {
    console.error("Error durante la limpieza:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
