import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { claimAssignedProductsForUser } from "@/lib/claimAssignedProducts";

const hasGoogleEnv =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

async function claimProductsForAuthUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      isBusiness: true,
      businessName: true,
      contactWhatsapp: true,
    },
  });
  if (user) {
    await claimAssignedProductsForUser(user);
  }
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await claimProductsForAuthUser(user.id);
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          await claimProductsForAuthUser(session.userId);
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
      isBusiness: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
      businessName: {
        type: "string",
        required: false,
        input: true,
      },
      contactWhatsapp: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  socialProviders: hasGoogleEnv
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : undefined,
});

