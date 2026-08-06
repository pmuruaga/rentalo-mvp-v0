-- CreateEnum
CREATE TYPE "UserVerificationStatus" AS ENUM ('NONE', 'VERIFIED_USER', 'VERIFIED_COMPANY');

-- AlterTable
ALTER TABLE "user" ADD COLUMN "verificationStatus" "UserVerificationStatus" NOT NULL DEFAULT 'NONE';
