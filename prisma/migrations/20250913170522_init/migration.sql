/*
  Warnings:

  - You are about to drop the column `created_at` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `entity_id` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `entity_type` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `ip_address` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `new_values` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `old_values` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `user_agent` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `login_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `failure_reason` on the `login_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `ip_address` on the `login_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `user_agent` on the `login_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `login_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_verified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `preferred_currency` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `preferred_language` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `two_factor_enabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `two_factor_secret` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `verification_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `identifier` on the `verification_tokens` table. All the data in the column will be lost.
  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `amenities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bookings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favorite_villas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `seasonal_pricing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `villa_amenities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `villa_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `villas` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `entityId` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityType` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ipAddress` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip` to the `login_attempts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `password` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `expiresAt` to the `verification_tokens` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `verification_tokens` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `type` to the `verification_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `verification_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "enum_entity_type" AS ENUM ('USER', 'LOGIN_ATTEMPT', 'BOOKING', 'VILLA', 'PAYMENT', 'VERIFICATION_TOKEN');

-- CreateEnum
CREATE TYPE "enum_verification_type" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PHONE_VERIFICATION', 'TWO_FACTOR_SETUP');

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_villa_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite_villas" DROP CONSTRAINT "favorite_villas_user_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite_villas" DROP CONSTRAINT "favorite_villas_villa_id_fkey";

-- DropForeignKey
ALTER TABLE "login_attempts" DROP CONSTRAINT "login_attempts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_villa_id_fkey";

-- DropForeignKey
ALTER TABLE "seasonal_pricing" DROP CONSTRAINT "seasonal_pricing_villa_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "villa_amenities" DROP CONSTRAINT "villa_amenities_amenity_id_fkey";

-- DropForeignKey
ALTER TABLE "villa_amenities" DROP CONSTRAINT "villa_amenities_villa_id_fkey";

-- DropForeignKey
ALTER TABLE "villa_images" DROP CONSTRAINT "villa_images_villa_id_fkey";

-- DropIndex
DROP INDEX "audit_logs_action_idx";

-- DropIndex
DROP INDEX "audit_logs_created_at_idx";

-- DropIndex
DROP INDEX "audit_logs_entity_type_entity_id_idx";

-- DropIndex
DROP INDEX "audit_logs_user_id_idx";

-- DropIndex
DROP INDEX "login_attempts_created_at_idx";

-- DropIndex
DROP INDEX "login_attempts_user_id_idx";

-- DropIndex
DROP INDEX "users_role_idx";

-- DropIndex
DROP INDEX "verification_tokens_identifier_token_key";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "created_at",
DROP COLUMN "entity_id",
DROP COLUMN "entity_type",
DROP COLUMN "ip_address",
DROP COLUMN "new_values",
DROP COLUMN "old_values",
DROP COLUMN "user_agent",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "entityId" TEXT NOT NULL,
ADD COLUMN     "entityType" "enum_entity_type" NOT NULL,
ADD COLUMN     "ipAddress" TEXT NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "action" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "login_attempts" DROP COLUMN "created_at",
DROP COLUMN "failure_reason",
DROP COLUMN "ip_address",
DROP COLUMN "user_agent",
DROP COLUMN "user_id",
ADD COLUMN     "blockedUntil" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ip" TEXT NOT NULL,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "email_verified",
DROP COLUMN "image",
DROP COLUMN "is_active",
DROP COLUMN "is_verified",
DROP COLUMN "preferred_currency",
DROP COLUMN "preferred_language",
DROP COLUMN "two_factor_enabled",
DROP COLUMN "two_factor_secret",
DROP COLUMN "updated_at",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "preferredCurrency" TEXT NOT NULL DEFAULT 'THB',
ADD COLUMN     "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "password" SET NOT NULL;

-- AlterTable
ALTER TABLE "verification_tokens" DROP COLUMN "expires",
DROP COLUMN "identifier",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "type" "enum_verification_type" NOT NULL,
ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "amenities";

-- DropTable
DROP TABLE "bookings";

-- DropTable
DROP TABLE "favorite_villas";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "reviews";

-- DropTable
DROP TABLE "seasonal_pricing";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "villa_amenities";

-- DropTable
DROP TABLE "villa_images";

-- DropTable
DROP TABLE "villas";

-- DropEnum
DROP TYPE "enum_booking_status";

-- DropEnum
DROP TYPE "enum_payment_method";

-- DropEnum
DROP TYPE "enum_payment_status";

-- DropEnum
DROP TYPE "enum_villa_type";

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_idx" ON "audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "audit_logs_entityId_idx" ON "audit_logs"("entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "login_attempts_userId_idx" ON "login_attempts"("userId");

-- CreateIndex
CREATE INDEX "login_attempts_ip_idx" ON "login_attempts"("ip");

-- CreateIndex
CREATE INDEX "login_attempts_created_at_idx" ON "login_attempts"("createdAt");

-- CreateIndex
CREATE INDEX "verification_tokens_token_idx" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_tokens_userId_idx" ON "verification_tokens"("userId");

-- CreateIndex
CREATE INDEX "verification_tokens_expiresAt_idx" ON "verification_tokens"("expiresAt");

-- AddForeignKey
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
