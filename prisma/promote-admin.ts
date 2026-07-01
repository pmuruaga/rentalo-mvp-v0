import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error("Uso: npm run admin:promote -- <email>");
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    console.error(`No se encontró ningún usuario con el email: ${email}`);
    process.exit(1);
  }

  if (user.role === UserRole.ADMIN) {
    console.log(`${user.email} ya es ADMIN.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: UserRole.ADMIN },
  });

  console.log(`Usuario promovido a ADMIN: ${user.email}`);
}

main()
  .catch((err) => {
    console.error("Error al promover usuario:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
