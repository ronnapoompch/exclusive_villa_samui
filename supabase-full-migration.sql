-- ======================================
-- Full Migration Script for Supabase
-- Generated: 2025-12-20T10:17:57.757Z
-- ======================================


-- ======================================
-- Migration: 20250913091116_initial
-- ======================================

-- CreateEnum
CREATE TYPE "public"."enum_user_role" AS ENUM ('USER', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "public"."enum_villa_type" AS ENUM ('BEACHFRONT', 'HILLSIDE', 'GARDEN', 'URBAN');

-- CreateEnum
CREATE TYPE "public"."enum_booking_status" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."enum_payment_status" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."enum_payment_method" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE', 'CASH');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "password" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "role" "public"."enum_user_role" NOT NULL DEFAULT 'USER',
    "preferred_language" TEXT NOT NULL DEFAULT 'en',
    "preferred_currency" TEXT NOT NULL DEFAULT 'THB',
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."villas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "distance_to_beach_meters" INTEGER,
    "area" VARCHAR(100),
    "villa_type" "public"."enum_villa_type" NOT NULL,
    "max_guests" INTEGER NOT NULL,
    "bedrooms_count" INTEGER NOT NULL,
    "bathrooms_count" INTEGER NOT NULL,
    "size_sqm" INTEGER,
    "floors" INTEGER NOT NULL DEFAULT 1,
    "year_built" INTEGER,
    "price_per_night_thb" DECIMAL(10,2) NOT NULL,
    "cleaning_fee_thb" DECIMAL(10,2),
    "security_deposit_thb" DECIMAL(10,2),
    "weekly_discount" DECIMAL(5,4),
    "monthly_discount" DECIMAL(5,4),
    "has_pool" BOOLEAN NOT NULL DEFAULT false,
    "has_beach_access" BOOLEAN NOT NULL DEFAULT false,
    "has_seaview" BOOLEAN NOT NULL DEFAULT false,
    "has_kitchen" BOOLEAN NOT NULL DEFAULT true,
    "has_wifi" BOOLEAN NOT NULL DEFAULT true,
    "has_aircon" BOOLEAN NOT NULL DEFAULT true,
    "has_parking" BOOLEAN NOT NULL DEFAULT true,
    "is_pet_friendly" BOOLEAN NOT NULL DEFAULT false,
    "can_host_events" BOOLEAN NOT NULL DEFAULT false,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "check_in_time" TEXT NOT NULL DEFAULT '15:00',
    "check_out_time" TEXT NOT NULL DEFAULT '11:00',
    "min_stay_nights" INTEGER NOT NULL DEFAULT 2,
    "meta_title" VARCHAR(255),
    "meta_description" VARCHAR(500),
    "amenities_data" JSONB,
    "house_rules" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "villas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookings" (
    "id" TEXT NOT NULL,
    "booking_number" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "check_in_date" DATE NOT NULL,
    "check_out_date" DATE NOT NULL,
    "adults_count" INTEGER NOT NULL,
    "children_count" INTEGER NOT NULL DEFAULT 0,
    "infants_count" INTEGER NOT NULL DEFAULT 0,
    "nightly_rate" DECIMAL(10,2) NOT NULL,
    "total_nights" INTEGER NOT NULL,
    "subtotal_amount" DECIMAL(10,2) NOT NULL,
    "cleaning_fee" DECIMAL(10,2),
    "service_fee" DECIMAL(10,2),
    "tax_amount" DECIMAL(10,2),
    "discount_amount" DECIMAL(10,2),
    "total_amount" DECIMAL(10,2) NOT NULL,
    "booking_status" "public"."enum_booking_status" NOT NULL DEFAULT 'PENDING',
    "payment_status" "public"."enum_payment_status" NOT NULL DEFAULT 'UNPAID',
    "guest_name" VARCHAR(255),
    "guest_email" VARCHAR(255),
    "guest_phone" VARCHAR(50),
    "special_requests" TEXT,
    "internal_notes" TEXT,
    "cancellation_reason" TEXT,
    "ota_source" TEXT,
    "ota_booking_id" TEXT,
    "ota_synced_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "payment_number" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'THB',
    "payment_method" "public"."enum_payment_method" NOT NULL,
    "payment_status" "public"."enum_payment_status" NOT NULL,
    "transaction_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "stripe_charge_id" TEXT,
    "description" TEXT,
    "receipt_url" TEXT,
    "failure_reason" TEXT,
    "paid_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "overall_rating" INTEGER NOT NULL,
    "cleanliness_rating" INTEGER,
    "accuracy_rating" INTEGER,
    "check_in_rating" INTEGER,
    "communication_rating" INTEGER,
    "location_rating" INTEGER,
    "value_rating" INTEGER,
    "title" VARCHAR(255),
    "comment" TEXT NOT NULL,
    "response" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."amenities" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(50),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."villa_amenities" (
    "villa_id" TEXT NOT NULL,
    "amenity_id" TEXT NOT NULL,

    CONSTRAINT "villa_amenities_pkey" PRIMARY KEY ("villa_id","amenity_id")
);

-- CreateTable
CREATE TABLE "public"."villa_images" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT,
    "caption" VARCHAR(255),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villa_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."favorite_villas" (
    "user_id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_villas_pkey" PRIMARY KEY ("user_id","villa_id")
);

-- CreateTable
CREATE TABLE "public"."seasonal_pricing" (
    "id" TEXT NOT NULL,
    "villa_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "price_per_night_thb" DECIMAL(10,2) NOT NULL,
    "min_stay_nights" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasonal_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."login_attempts" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "user_id" TEXT,
    "ip_address" VARCHAR(45) NOT NULL,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" TEXT NOT NULL,
    "user_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "villas_slug_key" ON "public"."villas"("slug");

-- CreateIndex
CREATE INDEX "villas_slug_idx" ON "public"."villas"("slug");

-- CreateIndex
CREATE INDEX "villas_price_per_night_thb_idx" ON "public"."villas"("price_per_night_thb");

-- CreateIndex
CREATE INDEX "villas_villa_type_is_available_idx" ON "public"."villas"("villa_type", "is_available");

-- CreateIndex
CREATE INDEX "villas_max_guests_idx" ON "public"."villas"("max_guests");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_number_key" ON "public"."bookings"("booking_number");

-- CreateIndex
CREATE INDEX "bookings_villa_id_check_in_date_check_out_date_idx" ON "public"."bookings"("villa_id", "check_in_date", "check_out_date");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "public"."bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_booking_status_idx" ON "public"."bookings"("booking_status");

-- CreateIndex
CREATE INDEX "bookings_booking_number_idx" ON "public"."bookings"("booking_number");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_number_key" ON "public"."payments"("payment_number");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "public"."payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_payment_status_idx" ON "public"."payments"("payment_status");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "public"."reviews"("booking_id");

-- CreateIndex
CREATE INDEX "reviews_villa_id_idx" ON "public"."reviews"("villa_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "public"."reviews"("user_id");

-- CreateIndex
CREATE INDEX "reviews_overall_rating_idx" ON "public"."reviews"("overall_rating");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "public"."amenities"("name");

-- CreateIndex
CREATE INDEX "amenities_category_idx" ON "public"."amenities"("category");

-- CreateIndex
CREATE INDEX "villa_images_villa_id_idx" ON "public"."villa_images"("villa_id");

-- CreateIndex
CREATE INDEX "seasonal_pricing_villa_id_start_date_end_date_idx" ON "public"."seasonal_pricing"("villa_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "login_attempts_email_idx" ON "public"."login_attempts"("email");

-- CreateIndex
CREATE INDEX "login_attempts_user_id_idx" ON "public"."login_attempts"("user_id");

-- CreateIndex
CREATE INDEX "login_attempts_created_at_idx" ON "public"."login_attempts"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "public"."audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "public"."audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "public"."audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "public"."accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "public"."sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "public"."villas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "public"."villas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."villa_amenities" ADD CONSTRAINT "villa_amenities_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "public"."villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."villa_amenities" ADD CONSTRAINT "villa_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."villa_images" ADD CONSTRAINT "villa_images_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "public"."villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_villas" ADD CONSTRAINT "favorite_villas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_villas" ADD CONSTRAINT "favorite_villas_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "public"."villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seasonal_pricing" ADD CONSTRAINT "seasonal_pricing_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "public"."villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."login_attempts" ADD CONSTRAINT "login_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- ======================================
-- Migration: 20250913170522_init
-- ======================================

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



-- ======================================
-- Migration: 20250913172422_add_villa_models
-- ======================================

-- CreateEnum
CREATE TYPE "enum_booking_status" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "enum_payment_status" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "villas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL DEFAULT 0,
    "maxGuests" INTEGER NOT NULL DEFAULT 0,
    "beachfront" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT NOT NULL,
    "locationLink" TEXT,
    "phone" TEXT,
    "officialWebsite" TEXT,
    "airbnbUrl" TEXT,
    "agodaUrl" TEXT,
    "images" JSONB,
    "amenities" JSONB,
    "minimumStay" TEXT,
    "petFriendly" BOOLEAN NOT NULL DEFAULT false,
    "cleaning" TEXT,
    "cook" TEXT,
    "utilities" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villa_pricing" (
    "id" TEXT NOT NULL,
    "villaId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER,
    "dailyRate" INTEGER,
    "weeklyRate" INTEGER,
    "monthlyRate" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villa_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "villaId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestPhone" TEXT,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "status" "enum_booking_status" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "enum_payment_status" NOT NULL DEFAULT 'PENDING',
    "specialRequests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "status" "enum_payment_status" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "villaId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "villas_slug_key" ON "villas"("slug");

-- CreateIndex
CREATE INDEX "villas_location_idx" ON "villas"("location");

-- CreateIndex
CREATE INDEX "villas_bedrooms_idx" ON "villas"("bedrooms");

-- CreateIndex
CREATE INDEX "villas_beachfront_idx" ON "villas"("beachfront");

-- CreateIndex
CREATE INDEX "villas_active_idx" ON "villas"("active");

-- CreateIndex
CREATE INDEX "villas_featured_idx" ON "villas"("featured");

-- CreateIndex
CREATE INDEX "villa_pricing_villaId_idx" ON "villa_pricing"("villaId");

-- CreateIndex
CREATE INDEX "villa_pricing_month_idx" ON "villa_pricing"("month");

-- CreateIndex
CREATE UNIQUE INDEX "villa_pricing_villaId_month_year_key" ON "villa_pricing"("villaId", "month", "year");

-- CreateIndex
CREATE INDEX "bookings_villaId_idx" ON "bookings"("villaId");

-- CreateIndex
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");

-- CreateIndex
CREATE INDEX "bookings_checkIn_idx" ON "bookings"("checkIn");

-- CreateIndex
CREATE INDEX "bookings_checkOut_idx" ON "bookings"("checkOut");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "payments_bookingId_idx" ON "payments"("bookingId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "reviews_villaId_idx" ON "reviews"("villaId");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_verified_idx" ON "reviews"("verified");

-- AddForeignKey
ALTER TABLE "villa_pricing" ADD CONSTRAINT "villa_pricing_villaId_fkey" FOREIGN KEY ("villaId") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_villaId_fkey" FOREIGN KEY ("villaId") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_villaId_fkey" FOREIGN KEY ("villaId") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;



-- ======================================
-- Migration: 20250913172715_fix_pricing_bigint
-- ======================================

-- AlterTable
ALTER TABLE "villa_pricing" ALTER COLUMN "dailyRate" SET DATA TYPE BIGINT,
ALTER COLUMN "weeklyRate" SET DATA TYPE BIGINT,
ALTER COLUMN "monthlyRate" SET DATA TYPE BIGINT;



-- ======================================
-- Migration: 20251006104923_add_payment_intent_and_password_reset
-- ======================================

/*
  Warnings:

  - A unique constraint covering the columns `[paymentIntentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "paymentIntentId" TEXT;

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_email_idx" ON "password_reset_tokens"("email");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentIntentId_key" ON "payments"("paymentIntentId");

-- CreateIndex
CREATE INDEX "payments_paymentIntentId_idx" ON "payments"("paymentIntentId");



-- ======================================
-- Migration: 20251006105108_add_userid_to_password_reset_token
-- ======================================

-- AlterTable
ALTER TABLE "password_reset_tokens" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- ======================================
-- Migration: 20251026132407_add_blocked_dates
-- ======================================

-- CreateTable
CREATE TABLE "blocked_dates" (
    "id" TEXT NOT NULL,
    "villaId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "source" TEXT DEFAULT 'Manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocked_dates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blocked_dates_villaId_idx" ON "blocked_dates"("villaId");

-- CreateIndex
CREATE INDEX "blocked_dates_date_idx" ON "blocked_dates"("date");

-- CreateIndex
CREATE INDEX "blocked_dates_source_idx" ON "blocked_dates"("source");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_dates_villaId_date_source_key" ON "blocked_dates"("villaId", "date", "source");

-- AddForeignKey
ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_villaId_fkey" FOREIGN KEY ("villaId") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- ======================================
-- Migration: 20251027142111_update_blocked_dates_for_ical_sync
-- ======================================

/*
  Warnings:

  - You are about to drop the column `date` on the `blocked_dates` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[villaId,externalId,source]` on the table `blocked_dates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `blocked_dates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `blocked_dates` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add new columns with temporary defaults
ALTER TABLE "blocked_dates" 
ADD COLUMN "startDate" TIMESTAMP(3),
ADD COLUMN "endDate" TIMESTAMP(3),
ADD COLUMN "externalId" TEXT;

-- Step 2: Migrate existing data (date -> startDate, endDate = startDate + 1 day)
UPDATE "blocked_dates" 
SET "startDate" = "date",
    "endDate" = "date" + INTERVAL '1 day'
WHERE "startDate" IS NULL;

-- Step 3: Make columns required (NOT NULL)
ALTER TABLE "blocked_dates" 
ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "endDate" SET NOT NULL;

-- Step 4: Drop old index and column
DROP INDEX "blocked_dates_date_idx";
DROP INDEX "blocked_dates_villaId_date_source_key";
ALTER TABLE "blocked_dates" DROP COLUMN "date";

-- Step 5: Create new indexes
CREATE INDEX "blocked_dates_startDate_idx" ON "blocked_dates"("startDate");
CREATE INDEX "blocked_dates_endDate_idx" ON "blocked_dates"("endDate");
CREATE UNIQUE INDEX "blocked_dates_villaId_externalId_source_key" ON "blocked_dates"("villaId", "externalId", "source");



-- ======================================
-- Migration: 20251027153743_add_price_rate_model
-- ======================================

-- CreateTable
CREATE TABLE "price_rates" (
    "id" TEXT NOT NULL,
    "villaId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "pricePerNight" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "minStay" INTEGER,
    "maxStay" INTEGER,
    "seasonName" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "externalId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_rates_villaId_idx" ON "price_rates"("villaId");

-- CreateIndex
CREATE INDEX "price_rates_startDate_endDate_idx" ON "price_rates"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "price_rates_active_idx" ON "price_rates"("active");

-- CreateIndex
CREATE INDEX "price_rates_source_idx" ON "price_rates"("source");

-- AddForeignKey
ALTER TABLE "price_rates" ADD CONSTRAINT "price_rates_villaId_fkey" FOREIGN KEY ("villaId") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- ======================================
-- Migration: 20251220062228_add_villa_images_model
-- ======================================

-- CreateTable
CREATE TABLE "villa_images" (
    "id" TEXT NOT NULL,
    "villaId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "altText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "format" TEXT DEFAULT 'webp',
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villa_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "villa_images_villaId_idx" ON "villa_images"("villaId");

-- CreateIndex
CREATE INDEX "villa_images_category_idx" ON "villa_images"("category");

-- CreateIndex
CREATE INDEX "villa_images_isHero_idx" ON "villa_images"("isHero");

-- CreateIndex
CREATE INDEX "villa_images_order_idx" ON "villa_images"("order");

-- AddForeignKey
ALTER TABLE "villa_images" ADD CONSTRAINT "villa_images_villaId_fkey" FOREIGN KEY ("villaId") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;


